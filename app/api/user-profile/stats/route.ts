import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserProfileService } from '@/lib/dynamodb/user-profile-service';

/**
 * PATCH /api/user-profile/stats
 * Actualizar estadísticas del usuario
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, statName, value } = body;

    if (action === 'increment' && statName) {
      // Incrementar un contador específico
      const success = await UserProfileService.incrementStat(
        session.user.id,
        statName,
        value || 1
      );

      if (!success) {
        return NextResponse.json(
          { error: 'Failed to increment stat' }, 
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: `${statName} incremented successfully`
      });
    } else {
      // Actualización completa de stats
      const success = await UserProfileService.updateStats(
        session.user.id,
        body
      );

      if (!success) {
        return NextResponse.json(
          { error: 'Failed to update stats' }, 
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Stats updated successfully'
      });
    }
  } catch (error) {
    console.error('Error updating stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}