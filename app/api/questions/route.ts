import { NextRequest, NextResponse } from 'next/server';
import { questionsService } from '@/lib/dynamodb';
import { auth } from '@/auth';

// GET /api/questions - Get all questions, optionally filtered by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const global = searchParams.get('global') === 'true'; // Check if requesting global questions

    let questions;

    if (global) {
      // Get global questions (no authentication required for home page)
      questions = await questionsService.getGlobalQuestions();
    } else {
      // Get user-specific questions (authentication required)
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      questions = await questionsService.getAllQuestions(session.user.id);
    }

    // Filter by type if specified
    if (type && type !== 'all') {
      questions = questions.filter((q) => {
        const context = q.context?.toLowerCase() || '';
        const questionText = q.question?.toLowerCase() || '';

        switch (type) {
          case 'behavioral':
            return (
              context.includes('behavioral') ||
              questionText.includes('behavioral')
            );
          case 'technical':
            return (
              context.includes('technical') ||
              questionText.includes('technical') ||
              context.includes('coding') ||
              questionText.includes('coding')
            );
          case 'system-design':
            return (
              context.includes('system') ||
              context.includes('design') ||
              questionText.includes('system') ||
              questionText.includes('design')
            );
          case 'leadership':
            return (
              context.includes('leadership') ||
              context.includes('management') ||
              questionText.includes('leadership') ||
              questionText.includes('management')
            );
          default:
            return false;
        }
      });
    }

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
    const {
      question,
      answer,
      context,
      type,
      programming_language,
      interview_id,
      global = false, // Default to user-specific question
    } = body;

    // Validate required fields
    if (!question || !answer || !context || !type || !programming_language) {
      return NextResponse.json(
        {
          error:
            'Question, answer, context, type, and programming_language are required',
        },
        { status: 400 }
      );
    }

    let questionData;

    if (global) {
      // Creating a global question (for home page)
      questionData = {
        question,
        answer,
        context,
        type,
        programming_language,
        global: true,
      };
    } else {
      // Creating a user-specific question (requires authentication)
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (!interview_id) {
        return NextResponse.json(
          { error: 'interview_id is required for user-specific questions' },
          { status: 400 }
        );
      }

      questionData = {
        question,
        answer,
        context,
        type,
        programming_language,
        interview_id,
        userId: session.user.id,
        global: false,
      };
    }

    const newQuestion = await questionsService.createQuestion(questionData);

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
