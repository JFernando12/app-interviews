import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserProfileService } from '@/lib/dynamodb/user-profile-service';

/**
 * PATCH /api/user-profile/subscription
 * Actualizar específicamente la suscripción del usuario
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, status, expiresAt, stripeCustomerId, stripePriceId } = body;

    // Solo admins pueden cambiar planes manualmente
    if ((plan || status) && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions to modify subscription plan' }, 
        { status: 403 }
      );
    }

    const subscriptionUpdates: any = {};
    if (plan) subscriptionUpdates.plan = plan;
    if (status) subscriptionUpdates.status = status;
    if (expiresAt) subscriptionUpdates.expiresAt = expiresAt;
    if (stripeCustomerId) subscriptionUpdates.stripeCustomerId = stripeCustomerId;
    if (stripePriceId) subscriptionUpdates.stripePriceId = stripePriceId;

    const success = await UserProfileService.updateSubscription(
      session.user.id,
      subscriptionUpdates
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update subscription' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}