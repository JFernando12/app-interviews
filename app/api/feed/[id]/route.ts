import { NextRequest, NextResponse } from 'next/server';
import { interviewsService, questionsService } from '@/lib/dynamodb';
import { UserProfileService } from '@/lib/dynamodb/user-profile-service';

// GET /api/feed/[id] - Get a specific public interview with user information and questions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the interview
    const interview = await interviewsService.getInterviewById(id);

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Check if interview is public
    if (!interview.public) {
      return NextResponse.json(
        { error: 'Interview not found or not public' },
        { status: 404 }
      );
    }

    // Get user profile information
    const userProfile = await UserProfileService.getProfile(interview.user_id);

    // Enrich interview with user profile information
    let enrichedInterview;
    if (interview.anonymous) {
      enrichedInterview = {
        ...interview,
        user: {
          name: 'Anonymous',
          title: null,
          company: null,
          avatar: null,
        },
      };
    } else {
      enrichedInterview = {
        ...interview,
        user: {
          name:
            userProfile?.profile?.title ||
            userProfile?.profile?.company ||
            'Developer',
          title: userProfile?.profile?.title || null,
          company: userProfile?.profile?.company || null,
          avatar: userProfile?.profile?.avatar || null,
        },
      };
    }

    // Get all questions for this interview (regardless of their public status)
    const questions = await questionsService.getQuestionsByInterviewId(id);

    // Return both interview and questions
    return NextResponse.json({
      interview: enrichedInterview,
      questions: questions,
    });
  } catch (error) {
    console.error('Error fetching public interview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview' },
      { status: 500 }
    );
  }
}