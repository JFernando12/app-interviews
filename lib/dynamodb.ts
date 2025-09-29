import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { QuestionType, InterviewState } from '@/types/enums';

// Configure DynamoDB client
const client = new DynamoDBClient({
  region: process.env.NEXT_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const QUESTIONS_TABLE_NAME =
  process.env.DYNAMODB_QUESTIONS_TABLE_NAME || 'questions';
const INTERVIEWS_TABLE_NAME =
  process.env.DYNAMODB_INTERVIEWS_TABLE_NAME || 'interviews';

export interface Question {
  id: string;
  question: string;
  context: string;
  answer: string;
  type: QuestionType;
  programming_language: string;
  interview_id?: string; // Optional for global questions
  user_id?: string; // Optional for global questions
  global: boolean; // True for global questions, false for user-specific
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  company: string;
  type?: QuestionType; // Optional, derived from question if not provided
  programming_language?: string; // Optional, derived from question if not provided
  state: InterviewState; // Required field for tracking interview progress
  user_id: string;
  video_path?: string; // Optional, S3 path to uploaded video
  public?: boolean; // Optional, whether the interview is public
  anonymous?: boolean; // Optional, whether the interview is anonymous (only when public is true)
  created_at: string;
  updated_at: string;
}

export class QuestionsService {
  // Create a new question
  async createQuestion(
    questionData: Omit<Question, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Question> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const question: Question = {
      id,
      ...questionData,
      created_at: now,
      updated_at: now,
    };

    const command = new PutCommand({
      TableName: QUESTIONS_TABLE_NAME,
      Item: question,
    });

    await docClient.send(command);
    return question;
  }

  // Get all questions for a user
  async getAllQuestions(user_id?: string): Promise<Question[]> {
    if (user_id) {
      // Get user-specific questions
      const command = new ScanCommand({
        TableName: QUESTIONS_TABLE_NAME,
        FilterExpression: 'user_id = :user_id AND #global = :global',
        ExpressionAttributeNames: {
          '#global': 'global',
        },
        ExpressionAttributeValues: {
          ':user_id': user_id,
          ':global': false,
        },
      });

      const response = await docClient.send(command);
      return (response.Items as Question[]) || [];
    } else {
      // Fallback for backward compatibility - return all questions
      const command = new ScanCommand({
        TableName: QUESTIONS_TABLE_NAME,
      });

      const response = await docClient.send(command);
      return (response.Items as Question[]) || [];
    }
  }

  // Get global questions (for home page)
  async getGlobalQuestions(): Promise<Question[]> {
    const command = new ScanCommand({
      TableName: QUESTIONS_TABLE_NAME,
      FilterExpression: '#global = :global',
      ExpressionAttributeNames: {
        '#global': 'global',
      },
      ExpressionAttributeValues: {
        ':global': true,
      },
    });

    const response = await docClient.send(command);
    return (response.Items as Question[]) || [];
  }

  // Get questions by interview ID
  async getQuestionsByInterviewId(
    interview_id: string,
    user_id?: string
  ): Promise<Question[]> {
    let filterExpression = 'interview_id = :interview_id';
    const expressionAttributeValues: any = {
      ':interview_id': interview_id,
    };

    // If user_id is provided, also filter by user_id for security
    if (user_id) {
      filterExpression += ' AND user_id = :user_id';
      expressionAttributeValues[':user_id'] = user_id;
    }

    const command = new ScanCommand({
      TableName: QUESTIONS_TABLE_NAME,
      FilterExpression: filterExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    const response = await docClient.send(command);
    return (response.Items as Question[]) || [];
  }

  // Get a specific question by ID
  async getQuestionById(id: string): Promise<Question | null> {
    const command = new GetCommand({
      TableName: QUESTIONS_TABLE_NAME,
      Key: { id },
    });

    const response = await docClient.send(command);
    return (response.Item as Question) || null;
  }

  // Update a question
  async updateQuestion(
    id: string,
    updates: Partial<Omit<Question, 'id' | 'created_at'>>
  ): Promise<Question | null> {
    const updated_at = new Date().toISOString();

    // Build update expression dynamically
    const updateExpressions: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};

    Object.entries({ ...updates, updated_at }).forEach(
      ([key, value], index) => {
        updateExpressions.push(`#${key} = :val${index}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:val${index}`] = value;
      }
    );

    const command = new UpdateCommand({
      TableName: QUESTIONS_TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const response = await docClient.send(command);
    return (response.Attributes as Question) || null;
  }

  // Delete a question
  async deleteQuestion(id: string): Promise<boolean> {
    const command = new DeleteCommand({
      TableName: QUESTIONS_TABLE_NAME,
      Key: { id },
    });

    await docClient.send(command);
    return true;
  }

  // Delete all questions associated with an interview
  async deleteQuestionsByInterviewId(
    interview_id: string,
    user_id?: string
  ): Promise<boolean> {
    try {
      // First, get all questions for this interview
      const questions = await this.getQuestionsByInterviewId(
        interview_id,
        user_id
      );

      // Delete each question individually
      const deletePromises = questions.map((question) =>
        this.deleteQuestion(question.id)
      );
      await Promise.all(deletePromises);

      return true;
    } catch (error) {
      console.error('Error deleting questions by interview_id:', error);
      return false;
    }
  }
}

export const questionsService = new QuestionsService();

export class InterviewsService {
  // Create a new interview
  async createInterview(
    interviewData: Omit<Interview, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Interview> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const interview: Interview = {
      id,
      ...interviewData,
      created_at: now,
      updated_at: now,
    };

    const command = new PutCommand({
      TableName: INTERVIEWS_TABLE_NAME,
      Item: interview,
    });

    await docClient.send(command);
    return interview;
  }

  // Get all interviews for a user
  async getAllInterviews(user_id?: string): Promise<Interview[]> {
    if (user_id) {
      const command = new ScanCommand({
        TableName: INTERVIEWS_TABLE_NAME,
        FilterExpression: 'user_id = :user_id',
        ExpressionAttributeValues: {
          ':user_id': user_id,
        },
      });

      const response = await docClient.send(command);
      return (response.Items as Interview[]) || [];
    } else {
      // Fallback for backward compatibility
      const command = new ScanCommand({
        TableName: INTERVIEWS_TABLE_NAME,
      });

      const response = await docClient.send(command);
      return (response.Items as Interview[]) || [];
    }
  }

  // Get a specific interview by ID
  async getInterviewById(id: string): Promise<Interview | null> {
    const command = new GetCommand({
      TableName: INTERVIEWS_TABLE_NAME,
      Key: { id },
    });

    const response = await docClient.send(command);
    return (response.Item as Interview) || null;
  }

  // Update an interview
  async updateInterview(
    id: string,
    updates: Partial<Omit<Interview, 'id' | 'created_at'>>
  ): Promise<Interview | null> {
    const updated_at = new Date().toISOString();

    // Build update expression dynamically
    const updateExpressions: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};

    Object.entries({ ...updates, updated_at }).forEach(
      ([key, value], index) => {
        updateExpressions.push(`#${key} = :val${index}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:val${index}`] = value;
      }
    );

    const command = new UpdateCommand({
      TableName: INTERVIEWS_TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const response = await docClient.send(command);
    return (response.Attributes as Interview) || null;
  }

  // Delete an interview and its associated questions
  async deleteInterview(id: string, user_id?: string): Promise<boolean> {
    try {
      // First, verify the interview exists and belongs to the user (if user_id provided)
      if (user_id) {
        const interview = await this.getInterviewById(id);
        if (!interview || interview.user_id !== user_id) {
          throw new Error('Interview not found or access denied');
        }
      }

      // Delete all associated questions first
      await questionsService.deleteQuestionsByInterviewId(id, user_id);

      // Then delete the interview
      const command = new DeleteCommand({
        TableName: INTERVIEWS_TABLE_NAME,
        Key: { id },
      });

      await docClient.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting interview:', error);
      return false;
    }
  }

  // Get all public interviews (for feed)
  async getPublicInterviews(): Promise<Interview[]> {
    const command = new ScanCommand({
      TableName: INTERVIEWS_TABLE_NAME,
      FilterExpression: '#public = :public',
      ExpressionAttributeNames: {
        '#public': 'public',
      },
      ExpressionAttributeValues: {
        ':public': true,
      },
    });

    const response = await docClient.send(command);
    return (response.Items as Interview[]) || [];
  }
}

export const interviewsService = new InterviewsService();