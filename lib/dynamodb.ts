import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';

// Configure DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
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
  type: string;
  programming_language: string;
  interview_id?: string; // Optional for global questions
  userId?: string; // Optional for global questions
  global: boolean; // True for global questions, false for user-specific
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  company: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export class QuestionsService {
  // Create a new question
  async createQuestion(
    questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Question> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const question: Question = {
      id,
      ...questionData,
      createdAt: now,
      updatedAt: now,
    };

    const command = new PutCommand({
      TableName: QUESTIONS_TABLE_NAME,
      Item: question,
    });

    await docClient.send(command);
    return question;
  }

  // Get all questions for a user
  async getAllQuestions(userId?: string): Promise<Question[]> {
    if (userId) {
      // Get user-specific questions
      const command = new ScanCommand({
        TableName: QUESTIONS_TABLE_NAME,
        FilterExpression: 'userId = :userId AND #global = :global',
        ExpressionAttributeNames: {
          '#global': 'global',
        },
        ExpressionAttributeValues: {
          ':userId': userId,
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
    updates: Partial<Omit<Question, 'id' | 'createdAt'>>
  ): Promise<Question | null> {
    const updatedAt = new Date().toISOString();

    // Build update expression dynamically
    const updateExpressions: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};

    Object.entries({ ...updates, updatedAt }).forEach(([key, value], index) => {
      updateExpressions.push(`#${key} = :val${index}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:val${index}`] = value;
    });

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
}

export const questionsService = new QuestionsService();

export class InterviewsService {
  // Create a new interview
  async createInterview(
    interviewData: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Interview> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const interview: Interview = {
      id,
      ...interviewData,
      createdAt: now,
      updatedAt: now,
    };

    const command = new PutCommand({
      TableName: INTERVIEWS_TABLE_NAME,
      Item: interview,
    });

    await docClient.send(command);
    return interview;
  }

  // Get all interviews for a user
  async getAllInterviews(userId?: string): Promise<Interview[]> {
    if (userId) {
      const command = new ScanCommand({
        TableName: INTERVIEWS_TABLE_NAME,
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
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
    updates: Partial<Omit<Interview, 'id' | 'createdAt'>>
  ): Promise<Interview | null> {
    const updatedAt = new Date().toISOString();

    // Build update expression dynamically
    const updateExpressions: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};

    Object.entries({ ...updates, updatedAt }).forEach(([key, value], index) => {
      updateExpressions.push(`#${key} = :val${index}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:val${index}`] = value;
    });

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

  // Delete an interview
  async deleteInterview(id: string): Promise<boolean> {
    const command = new DeleteCommand({
      TableName: INTERVIEWS_TABLE_NAME,
      Key: { id },
    });

    await docClient.send(command);
    return true;
  }
}

export const interviewsService = new InterviewsService();