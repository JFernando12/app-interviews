import { NextRequest, NextResponse } from 'next/server';
import { questionsService } from '@/lib/dynamodb';
import { auth } from '@/auth';
import { QuestionType, QuestionTypeUtils } from '@/types/enums';

// GET /api/questions - Get all questions, optionally filtered by type or interview_id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const interview_id = searchParams.get('interview_id');
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

      if (interview_id) {
        // Get questions for a specific interview
        questions = await questionsService.getQuestionsByInterviewId(interview_id, session.user.id);
      } else {
        // Get all user questions
        questions = await questionsService.getAllQuestions(session.user.id);
      }
    }

    // Filter by type if specified
    if (type && type !== 'all') {
      questions = questions.filter((q) => q.type === type);
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
    if (!question || !answer) {
      return NextResponse.json(
        {
          error: 'Question and answer are required',
        },
        { status: 400 }
      );
    }

    // Validate and normalize the type field
    const normalizedType =
      QuestionTypeUtils.fromString(type) || QuestionType.OTHER;

    let questionData;

    if (global) {
      // Creating a global question (for home page)
      questionData = {
        question,
        answer,
        context,
        type: normalizedType,
        programming_language,
        global: true,
      };
    } else {
      // Creating a user-specific question (requires authentication)
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      questionData = {
        question,
        answer,
        context: context,
        type: normalizedType,
        programming_language: programming_language,
        interview_id,
        user_id: session.user.id,
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
