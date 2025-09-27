import { NextRequest, NextResponse } from 'next/server';
import { questionsService } from '@/lib/dynamodb';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/questions/[id] - Get a specific question
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const question = await questionsService.getQuestionById(id);

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}

// PUT /api/questions/[id] - Update a specific question
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { question, answer, context } = body;

    // Validate that at least one field is provided
    if (!question && !answer && !context) {
      return NextResponse.json(
        { error: 'At least one field (question, answer, or context) is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (question) updates.question = question;
    if (answer) updates.answer = answer;
    if (context) updates.context = context;

    const updatedQuestion = await questionsService.updateQuestion(id, updates);

    if (!updatedQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

// DELETE /api/questions/[id] - Delete a specific question
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await questionsService.deleteQuestion(id);

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}