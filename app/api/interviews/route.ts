import { NextRequest, NextResponse } from 'next/server';
import { interviewsService } from '@/lib/dynamodb';

// GET /api/interviews - Get all interviews
export async function GET() {
  try {
    const interviews = await interviewsService.getAllInterviews();
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
    const body = await request.json();
    const { company } = body;

    // Validate required fields
    if (!company) {
      return NextResponse.json(
        { error: 'Company is required' },
        { status: 400 }
      );
    }

    const newInterview = await interviewsService.createInterview({
      company,
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
