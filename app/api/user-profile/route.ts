import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserProfileService } from '@/lib/dynamodb/user-profile-service';
import { UserProfileUpdate } from '@/lib/dynamodb/schemas';

/**
 * GET /api/user-profile
 * Obtener el perfil completo del usuario actual
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Intentar obtener el perfil existente
    let profile = await UserProfileService.getProfile(session.user.id);
    
    // Si no existe, crear uno por defecto
    if (!profile) {
      profile = await UserProfileService.createDefaultProfile(
        session.user.id,
        session.user.email!,
        session.user.name || undefined
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user-profile
 * Actualizar parcialmente el perfil del usuario
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: UserProfileUpdate = body;

    // Validaciones básicas
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Invalid update data' }, 
        { status: 400 }
      );
    }

    // Prevenir modificación de campos protegidos
    delete updates.user_id;
    delete updates.createdAt;
    delete updates.version;

    // Validar suscripción (solo admins pueden cambiar planes manualmente)
    if (updates.subscription && session.user.role !== 'admin') {
      // Los usuarios regulares solo pueden actualizar ciertas propiedades
      const allowedSubscriptionFields = ['stripeCustomerId', 'stripePriceId'];
      const subscriptionKeys = Object.keys(updates.subscription);
      const hasDisallowedFields = subscriptionKeys.some(
        key => !allowedSubscriptionFields.includes(key)
      );
      
      if (hasDisallowedFields) {
        return NextResponse.json(
          { error: 'Insufficient permissions to modify subscription' }, 
          { status: 403 }
        );
      }
    }

    // Actualizar el perfil
    const updatedProfile = await UserProfileService.updateProfile(
      session.user.id,
      updates
    );

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Failed to update profile' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/user-profile
 * Crear un nuevo perfil (normalmente se hace automáticamente)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar si ya existe un perfil
    const existingProfile = await UserProfileService.getProfile(session.user.id);
    if (existingProfile) {
      return NextResponse.json(
        { 
          message: 'Profile already exists',
          profile: existingProfile 
        }, 
        { status: 200 }
      );
    }

    // Crear nuevo perfil
    const profile = await UserProfileService.createDefaultProfile(
      session.user.id,
      session.user.email!,
      session.user.name || undefined
    );

    return NextResponse.json({ 
      message: 'Profile created successfully',
      profile 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}