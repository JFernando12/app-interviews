import { NextRequest, NextResponse } from 'next/server';
import { questionsService } from '@/lib/dynamodb';

// GET /api/questions - Get all questions
export async function GET() {
  try {
    const questions = await questionsService.getAllQuestions();
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// POST /api/questions - Create a new question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer, context } = body;

    // Validate required fields
    if (!question || !answer || !context) {
      return NextResponse.json(
        { error: 'Question, answer, and context are required' },
        { status: 400 }
      );
    }

    const newQuestion = await questionsService.createQuestion({
      question,
      answer,
      context,
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
