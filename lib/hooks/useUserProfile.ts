'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { UserProfile, UserProfileUpdate } from '@/lib/dynamodb/schemas';

interface UseUserProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  updateProfile: (updates: UserProfileUpdate) => Promise<boolean>;
  updateSubscription: (subscriptionData: any) => Promise<boolean>;
  incrementStat: (statName: string, value?: number) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  hasFeature: (feature: string) => boolean;
}

export function useUserProfile(): UseUserProfileReturn {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener el perfil del usuario
   */
  const fetchProfile = useCallback(async () => {
    if (!session?.user?.id) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await fetch('/api/user-profile');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setIsError(true);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  /**
   * Actualizar el perfil
   */
  const updateProfile = useCallback(async (updates: UserProfileUpdate): Promise<boolean> => {
    try {
      const response = await fetch('/api/user-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  }, []);

  /**
   * Actualizar suscripción
   */
  const updateSubscription = useCallback(async (subscriptionData: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/user-profile/subscription', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update subscription');
      }

      // Refrescar el perfil después de actualizar la suscripción
      await fetchProfile();
      return true;
    } catch (err) {
      console.error('Error updating subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to update subscription');
      return false;
    }
  }, [fetchProfile]);

  /**
   * Incrementar estadística
   */
  const incrementStat = useCallback(async (statName: string, value: number = 1): Promise<boolean> => {
    try {
      const response = await fetch('/api/user-profile/stats', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'increment',
          statName,
          value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to increment stat');
      }

      // Actualizar el estado local optimistamente
      if (profile) {
        setProfile(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            [statName]: (prev.stats[statName as keyof typeof prev.stats] as number || 0) + value,
            lastActive: new Date().toISOString(),
          }
        } : null);
      }

      return true;
    } catch (err) {
      console.error('Error incrementing stat:', err);
      setError(err instanceof Error ? err.message : 'Failed to increment stat');
      return false;
    }
  }, [profile]);

  /**
   * Refrescar perfil manualmente
   */
  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  /**
   * Verificar si el usuario tiene una feature específica
   */
  const hasFeature = useCallback((feature: string): boolean => {
    return profile?.subscription.features.includes(feature) || false;
  }, [profile]);

  // Efecto para cargar el perfil cuando cambia la sesión
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    isError,
    error,
    updateProfile,
    updateSubscription,
    incrementStat,
    refreshProfile,
    hasFeature,
  };
}

// Hook específico para configuraciones
export function useUserSettings() {
  const { profile, updateProfile, isLoading } = useUserProfile();
  
  const updateSettings = useCallback(async (settings: Partial<UserProfile['settings']>) => {
    if (!profile) return false;
    const updatedSettings = { ...profile.settings, ...settings };
    return await updateProfile({ settings: updatedSettings });
  }, [updateProfile, profile]);

  return {
    settings: profile?.settings,
    updateSettings,
    isLoading,
  };
}

// Hook específico para preferencias de entrevistas
export function useInterviewPreferences() {
  const { profile, updateProfile, isLoading } = useUserProfile();
  
  const updatePreferences = useCallback(async (preferences: Partial<UserProfile['interviewPreferences']>) => {
    if (!profile) return false;
    const updatedPreferences = { ...profile.interviewPreferences, ...preferences };
    return await updateProfile({ interviewPreferences: updatedPreferences });
  }, [updateProfile, profile]);

  return {
    preferences: profile?.interviewPreferences,
    updatePreferences,
    isLoading,
  };
}

// Hook para estadísticas y gamificación
export function useUserStats() {
  const { profile, incrementStat, isLoading } = useUserProfile();
  
  const recordInterview = useCallback(async (type: 'interviewer' | 'candidate') => {
    const promises = [
      incrementStat('totalInterviews'),
      incrementStat(type === 'interviewer' ? 'interviewsAsInterviewer' : 'interviewsAsCandidate'),
    ];
    
    const results = await Promise.all(promises);
    return results.every(result => result);
  }, [incrementStat]);

  const recordQuestionCreated = useCallback(async () => {
    return await incrementStat('totalQuestionsCreated');
  }, [incrementStat]);

  const recordQuestionAnswered = useCallback(async () => {
    return await incrementStat('totalQuestionsAnswered');
  }, [incrementStat]);

  return {
    stats: profile?.stats,
    recordInterview,
    recordQuestionCreated,
    recordQuestionAnswered,
    isLoading,
  };
}