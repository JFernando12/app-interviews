import { NextRequest, NextResponse } from 'next/server';
import { questionsService } from '@/lib/dynamodb';
import { auth } from '@/auth';

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

    // For global questions, no authentication is required
    if (question.global) {
      return NextResponse.json(question);
    }

    // For user-specific questions, check authentication and ownership
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the question belongs to the user
    if (question.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    // First check if question exists
    const existingQuestion = await questionsService.getQuestionById(id);
    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // For global questions, allow updates without authentication (admin functionality)
    // For user-specific questions, check authentication and ownership
    if (!existingQuestion.global) {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (existingQuestion.user_id !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const body = await request.json();
    const {
      question,
      answer,
      context,
      type,
      programming_language,
      interview_id,
    } = body;

    // Validate that at least one field is provided
    if (
      !question &&
      !answer &&
      !context &&
      !type &&
      !programming_language &&
      !interview_id
    ) {
      return NextResponse.json(
        { error: 'At least one field is required for update' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (question) updates.question = question;
    if (answer) updates.answer = answer;
    if (context) updates.context = context;
    if (type) updates.type = type;
    if (programming_language)
      updates.programming_language = programming_language;
    if (interview_id) updates.interview_id = interview_id;

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

    // First check if question exists
    const existingQuestion = await questionsService.getQuestionById(id);
    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // For global questions, allow deletion without authentication (admin functionality)
    // For user-specific questions, check authentication and ownership
    if (!existingQuestion.global) {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (existingQuestion.user_id !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

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