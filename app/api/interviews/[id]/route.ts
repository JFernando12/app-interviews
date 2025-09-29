import { NextRequest, NextResponse } from 'next/server';
import { interviewsService } from '@/lib/dynamodb';
import { auth } from '@/auth';
import { InterviewState, QuestionType } from '@/types/enums';

// GET /api/interviews/[id] - Get a specific interview
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const interview = await interviewsService.getInterviewById(id);

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Check if the interview belongs to the user
    if (interview.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(interview);
  } catch (error) {
    console.error('Error fetching interview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview' },
      { status: 500 }
    );
  }
}

// PUT /api/interviews/[id] - Update a specific interview
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      company,
      programming_language,
      type,
      state,
      video_path,
      public: isPublic,
      anonymous,
    } = body;

    // Validate required fields
    if (!company) {
      return NextResponse.json(
        { error: 'Company is required' },
        { status: 400 }
      );
    }

    // Verify that the interview exists and belongs to the user
    const interview = await interviewsService.getInterviewById(id);

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    if (interview.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to interview' },
        { status: 403 }
      );
    }

    // Validate state enum if provided
    if (state && !Object.values(InterviewState).includes(state)) {
      return NextResponse.json(
        { error: 'Invalid state value' },
        { status: 400 }
      );
    }

    // Validate type enum if provided
    if (type && !Object.values(QuestionType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type value' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = { company };
    if (programming_language !== undefined)
      updateData.programming_language = programming_language;
    if (type !== undefined) updateData.type = type;
    if (state !== undefined) updateData.state = state;
    if (video_path !== undefined) updateData.video_path = video_path;
    if (isPublic !== undefined) updateData.public = isPublic;
    if (anonymous !== undefined) updateData.anonymous = anonymous;

    const updatedInterview = await interviewsService.updateInterview(
      id,
      updateData
    );

    if (!updatedInterview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedInterview);
  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json(
      { error: 'Failed to update interview' },
      { status: 500 }
    );
  }
}

// DELETE /api/interviews/[id] - Delete a specific interview
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify that the interview exists and belongs to the user
    const interview = await interviewsService.getInterviewById(id);

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    if (interview.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to interview' },
        { status: 403 }
      );
    }

    const success = await interviewsService.deleteInterview(
      id,
      session.user.id
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete interview and associated questions' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Interview and associated questions deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting interview:', error);
    return NextResponse.json(
      { error: 'Failed to delete interview' },
      { status: 500 }
    );
  }
}
