export enum QuestionType {
  HUMAN_RESOURCES = 'humanresources',
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  SYSTEM_DESIGN = 'systemdesign',
  LEADERSHIP = 'leadership',
  CODING = 'coding',
  AI_ENGINEER = 'aiengineer',
  OTHER = 'other',
}

const QUESTION_TYPE_DISPLAY: Record<QuestionType, string> = {
  [QuestionType.HUMAN_RESOURCES]: 'Human Resources',
  [QuestionType.TECHNICAL]: 'Technical',
  [QuestionType.BEHAVIORAL]: 'Behavioral',
  [QuestionType.SYSTEM_DESIGN]: 'System Design',
  [QuestionType.LEADERSHIP]: 'Leadership',
  [QuestionType.CODING]: 'Coding',
  [QuestionType.AI_ENGINEER]: 'AI Engineer',
  [QuestionType.OTHER]: 'Other',
};

const QUESTION_TYPE_DESCRIPTIONS: Record<QuestionType, string> = {
  [QuestionType.HUMAN_RESOURCES]:
    'Assess HR policies, employment law, recruiting practices, and workforce management',
  [QuestionType.TECHNICAL]:
    'Evaluate coding skills, algorithms, and technical problem-solving abilities',
  [QuestionType.BEHAVIORAL]:
    'Assess soft skills, past experiences, and cultural fit through STAR methodology',
  [QuestionType.SYSTEM_DESIGN]:
    'Test architecture knowledge, scalability thinking, and system trade-offs',
  [QuestionType.LEADERSHIP]:
    'Explore management philosophy, team building, and strategic decision-making',
  [QuestionType.CODING]: 'Test programming skills and algorithm implementation',
  [QuestionType.AI_ENGINEER]:
    'Master LLMs, RAG, embeddings, prompt engineering, fine-tuning, and AI agent design',
  [QuestionType.OTHER]: "Questions that don't fit into the standard categories",
};

export class QuestionTypeUtils {
  static getDisplayName(type: QuestionType): string {
    return QUESTION_TYPE_DISPLAY[type] || 'Unknown';
  }

  static getDescription(type: QuestionType): string {
    return QUESTION_TYPE_DESCRIPTIONS[type] || '';
  }
}
