import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { AWSService, SQSMessage } from '@/lib/aws';
import { interviewsService } from '@/lib/dynamodb';
import { InterviewState } from '@/types/enums';

// POST /api/interviews/process-video - Finalize video upload and send to processing queue
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { interview_id, video_path } = body;

    // Validate required fields
    if (!interview_id || !video_path) {
      return NextResponse.json(
        { error: 'interview_id and video_path are required' },
        { status: 400 }
      );
    }

    // Verify that the interview exists and belongs to the user
    const interview = await interviewsService.getInterviewById(interview_id);
    
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

    // Update interview with video path and set state to processing
    const updatedInterview = await interviewsService.updateInterview(
      interview_id,
      {
        video_path: video_path,
      }
    );

    if (!updatedInterview) {
      return NextResponse.json(
        { error: 'Failed to update interview' },
        { status: 500 }
      );
    }

    // Prepare SQS message for video processing
    const sqsMessage: SQSMessage = {
      interview_id: interview_id,
      video_path: video_path,
      user_id: session.user.id,
      timestamp: new Date().toISOString(),
    };

    // Send message to SQS queue
    await AWSService.sendVideoProcessingMessage(sqsMessage);

    return NextResponse.json({
      success: true,
      interview: updatedInterview,
      message: 'Video uploaded successfully and sent for processing',
    });

  } catch (error) {
    console.error('Error processing video upload:', error);
    return NextResponse.json(
      { error: 'Failed to process video upload' },
      { status: 500 }
    );
  }
}