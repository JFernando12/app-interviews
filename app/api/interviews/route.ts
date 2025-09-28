import { NextRequest, NextResponse } from 'next/server';
import { interviewsService, questionsService } from '@/lib/dynamodb';
import { auth } from '@/auth';
import { InterviewState, QuestionType } from '@/types/enums';

// GET /api/interviews - Get all interviews
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const interviews = await interviewsService.getAllInterviews(
      session.user.id
    );
    return NextResponse.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}

// POST /api/interviews - Create a new interview
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { company, programming_language, type } = body;

    // Validate required fields
    if (!company) {
      return NextResponse.json(
        { error: 'Company is required' },
        { status: 400 }
      );
    }

    // If question_id is provided, get question details to inherit language and type
    let derivedLanguage = programming_language;
    let derivedType = type;

    const newInterview = await interviewsService.createInterview({
      company,
      programming_language: derivedLanguage,
      type: derivedType,
      state: InterviewState.PENDING, // Default state for new interviews
      user_id: session.user.id,
    });

    return NextResponse.json(newInterview, { status: 201 });
  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { error: 'Failed to create interview' },
      { status: 500 }
    );
  }
}
