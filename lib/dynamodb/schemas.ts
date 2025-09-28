// Schema para perfiles de usuario extendidos
export interface UserProfile {
  user_id: string; // Referencia al user.id de NextAuth (se guarda como 'id' en DynamoDB)

  // Suscripciones y planes
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    expiresAt: string; // ISO date
    startedAt: string; // ISO date
    stripeCustomerId?: string;
    stripePriceId?: string;
    features: string[]; // ['unlimited_interviews', 'ai_feedback', 'team_management', etc.]
  };

  // Información del perfil profesional
  profile: {
    description: string; // "Backend Developer", etc.
    title: string; // "Senior Software Engineer"
    company?: string;
    skills: string[]; // ["JavaScript", "Python", "AWS", etc.]
    experience: number; // años de experiencia
    location: string;
    timezone: string; // "America/New_York"
    website?: string;
    github?: string;
    linkedin?: string;
    avatar?: string; // URL de avatar personalizado
    bio?: string; // Biografía más larga
  };

  // Configuraciones de la aplicación
  settings: {
    theme: 'light' | 'dark' | 'system';
    language: 'es' | 'en';
    emailNotifications: boolean;
    interviewReminders: boolean;
    publicProfile: boolean;
    analyticsOptIn: boolean;
    marketingEmails: boolean;
  };

  // Preferencias para entrevistas
  interviewPreferences: {
    preferredTechnologies: string[]; // Tecnologías que prefiere para entrevistas
    difficulty: 'junior' | 'mid' | 'senior' | 'lead';
    preferredDuration: number; // minutos (30, 45, 60, 90)
    recordingSessions: boolean;
    allowVideoCall: boolean;
    availableHours: {
      // Horarios disponibles por día (en formato 24h)
      monday: { start: string; end: string } | null; // "09:00" - "17:00"
      tuesday: { start: string; end: string } | null;
      wednesday: { start: string; end: string } | null;
      thursday: { start: string; end: string } | null;
      friday: { start: string; end: string } | null;
      saturday: { start: string; end: string } | null;
      sunday: { start: string; end: string } | null;
    };
  };

  // Estadísticas y métricas del usuario
  stats: {
    totalInterviews: number;
    interviewsAsInterviewer: number;
    interviewsAsCandidate: number;
    averageRating: number; // 1-5 estrellas
    totalQuestionsCreated: number;
    totalQuestionsAnswered: number;
    streakDays: number; // Días consecutivos activo
    lastActive: string; // ISO date
  };

  // Configuraciones de privacidad
  privacy: {
    showEmail: boolean;
    showRealName: boolean;
    showCompany: boolean;
    showLocation: boolean;
    allowDirectMessages: boolean;
    profileVisibility: 'public' | 'registered_users' | 'private';
  };

  // Metadata del sistema
  created_at: string;
  updated_at: string;
  version: number; // Para versionado de configuraciones
}

// Schema para configuraciones por defecto
export const DEFAULT_USER_PROFILE = {
  subscription: {
    plan: 'free' as const,
    status: 'active' as const,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
    startedAt: new Date().toISOString(),
    features: ['basic_interviews', 'question_creation', 'profile_customization']
  },
  profile: {
    description: 'Software Developer',
    title: 'Developer',
    skills: [],
    experience: 0,
    location: '',
    timezone: 'America/New_York',
    bio: ''
  },
  settings: {
    theme: 'system' as const,
    language: 'es' as const,
    emailNotifications: true,
    interviewReminders: true,
    publicProfile: false,
    analyticsOptIn: true,
    marketingEmails: false,
  },
  interviewPreferences: {
    preferredTechnologies: [],
    difficulty: 'mid' as const,
    preferredDuration: 60,
    recordingSessions: false,
    allowVideoCall: true,
    availableHours: {
      monday: { start: "09:00", end: "17:00" },
      tuesday: { start: "09:00", end: "17:00" },
      wednesday: { start: "09:00", end: "17:00" },
      thursday: { start: "09:00", end: "17:00" },
      friday: { start: "09:00", end: "17:00" },
      saturday: null,
      sunday: null,
    }
  },
  stats: {
    totalInterviews: 0,
    interviewsAsInterviewer: 0,
    interviewsAsCandidate: 0,
    averageRating: 0,
    totalQuestionsCreated: 0,
    totalQuestionsAnswered: 0,
    streakDays: 0,
    lastActive: new Date().toISOString(),
  },
  privacy: {
    showEmail: false,
    showRealName: true,
    showCompany: true,
    showLocation: true,
    allowDirectMessages: true,
    profileVisibility: 'registered_users' as const,
  }
};

// Tipos para actualizaciones parciales
export type UserProfileUpdate = Partial<UserProfile>;

// Tipos para secciones específicas
export type SubscriptionUpdate = Partial<UserProfile['subscription']>;
export type ProfileUpdate = Partial<UserProfile['profile']>;
export type SettingsUpdate = Partial<UserProfile['settings']>;
export type InterviewPreferencesUpdate = Partial<UserProfile['interviewPreferences']>;
export type StatsUpdate = Partial<UserProfile['stats']>;
export type PrivacyUpdate = Partial<UserProfile['privacy']>;

// Enum para planes de suscripción
export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

// Enum para estados de suscripción
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing'
}

// Features por plan
export const PLAN_FEATURES = {
  free: [
    'basic_interviews',
    'question_creation',
    'profile_customization'
  ],
  pro: [
    'basic_interviews',
    'question_creation',
    'profile_customization',
    'unlimited_interviews',
    'ai_feedback',
    'video_recording',
    'analytics',
    'priority_support'
  ],
  enterprise: [
    'basic_interviews',
    'question_creation',
    'profile_customization',
    'unlimited_interviews',
    'ai_feedback',
    'video_recording',
    'analytics',
    'priority_support',
    'team_management',
    'custom_branding',
    'api_access',
    'sso_integration'
  ]
} as const;