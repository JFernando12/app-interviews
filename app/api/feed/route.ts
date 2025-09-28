import { NextResponse } from 'next/server';
import { interviewsService } from '@/lib/dynamodb';
import { UserProfileService } from '@/lib/dynamodb/user-profile-service';

// GET /api/feed - Get all public interviews with user information
export async function GET() {
  try {
    // Get all public interviews
    const publicInterviews = await interviewsService.getPublicInterviews();

    // Sort by created_at descending (newest first)
    const sortedInterviews = publicInterviews.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Enrich interviews with user profile information
    const enrichedInterviews = await Promise.all(
      sortedInterviews.map(async (interview) => {
        const userProfile = await UserProfileService.getProfile(interview.user_id);
        
        // If anonymous is true, don't include user profile info
        if (interview.anonymous) {
          return {
            ...interview,
            user: {
              name: 'Anonymous',
              title: null,
              company: null,
              avatar: null,
            }
          };
        }

        // Include basic user profile info
        return {
          ...interview,
          user: {
            name: userProfile?.profile?.title || userProfile?.profile?.company || 'Developer',
            title: userProfile?.profile?.title || null,
            company: userProfile?.profile?.company || null,
            avatar: userProfile?.profile?.avatar || null,
          }
        };
      })
    );

    return NextResponse.json(enrichedInterviews);
  } catch (error) {
    console.error('Error fetching public interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public interviews' },
      { status: 500 }
    );
  }
}