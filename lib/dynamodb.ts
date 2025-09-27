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

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'questions';

export interface Question {
  id: string;
  question: string;
  answer: string;
  context: string;
  createdAt: string;
  updatedAt: string;
}

export class QuestionsService {
  
  // Create a new question
  async createQuestion(questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Question> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const question: Question = {
      id,
      ...questionData,
      createdAt: now,
      updatedAt: now,
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: question,
    });

    await docClient.send(command);
    return question;
  }

  // Get all questions
  async getAllQuestions(): Promise<Question[]> {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await docClient.send(command);
    return (response.Items as Question[]) || [];
  }

  // Get a specific question by ID
  async getQuestionById(id: string): Promise<Question | null> {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });

    const response = await docClient.send(command);
    return (response.Item as Question) || null;
  }

  // Update a question
  async updateQuestion(id: string, updates: Partial<Omit<Question, 'id' | 'createdAt'>>): Promise<Question | null> {
    const updatedAt = new Date().toISOString();
    
    // Build update expression dynamically
    const updateExpressions: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};
    
    Object.entries({...updates, updatedAt}).forEach(([key, value], index) => {
      updateExpressions.push(`#${key} = :val${index}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:val${index}`] = value;
    });

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
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
      TableName: TABLE_NAME,
      Key: { id },
    });

    await docClient.send(command);
    return true;
  }
}

export const questionsService = new QuestionsService();