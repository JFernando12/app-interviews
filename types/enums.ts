// Standardized enum system for question types
// All enum values are lowercase without spaces for consistency

export enum QuestionType {
  BEHAVIORAL = 'behavioral',
  TECHNICAL = 'technical',
  SYSTEM_DESIGN = 'systemdesign',
  LEADERSHIP = 'leadership',
  CODING = 'coding',
  OTHER = 'other',
}

// Display names for UI
export const QUESTION_TYPE_DISPLAY: Record<QuestionType, string> = {
  [QuestionType.BEHAVIORAL]: 'Behavioral',
  [QuestionType.TECHNICAL]: 'Technical',
  [QuestionType.SYSTEM_DESIGN]: 'System Design',
  [QuestionType.LEADERSHIP]: 'Leadership',
  [QuestionType.CODING]: 'Coding',
  [QuestionType.OTHER]: 'Other',
};

// Descriptions for each type
export const QUESTION_TYPE_DESCRIPTIONS: Record<QuestionType, string> = {
  [QuestionType.BEHAVIORAL]: 'Assess soft skills, past experiences, and cultural fit through STAR methodology',
  [QuestionType.TECHNICAL]: 'Evaluate coding skills, algorithms, and technical problem-solving abilities',
  [QuestionType.SYSTEM_DESIGN]: 'Test architecture knowledge, scalability thinking, and system trade-offs',
  [QuestionType.LEADERSHIP]: 'Explore management philosophy, team building, and strategic decision-making',
  [QuestionType.CODING]: 'Test programming skills and algorithm implementation',
  [QuestionType.OTHER]: 'Questions that don\'t fit into the standard categories',
};

// Keywords for categorizing existing questions
export const QUESTION_TYPE_KEYWORDS: Record<QuestionType, string[]> = {
  [QuestionType.BEHAVIORAL]: ['behavioral', 'behavior', 'soft skill', 'culture', 'experience'],
  [QuestionType.TECHNICAL]: ['technical', 'technology', 'framework', 'tools', 'architecture'],
  [QuestionType.SYSTEM_DESIGN]: ['system', 'design', 'architecture', 'scalability', 'infrastructure'],
  [QuestionType.LEADERSHIP]: ['leadership', 'management', 'team', 'lead', 'manager'],
  [QuestionType.CODING]: ['coding', 'algorithm', 'programming', 'implement', 'code'],
  [QuestionType.OTHER]: ['other', 'general', 'misc'],
};

// Utility functions
export class QuestionTypeUtils {
  /**
   * Get all available question types
   */
  static getAllTypes(): QuestionType[] {
    return Object.values(QuestionType);
  }

  /**
   * Get display name for a question type
   */
  static getDisplayName(type: QuestionType): string {
    return QUESTION_TYPE_DISPLAY[type] || 'Unknown';
  }

  /**
   * Get description for a question type
   */
  static getDescription(type: QuestionType): string {
    return QUESTION_TYPE_DESCRIPTIONS[type] || '';
  }

  /**
   * Convert string to QuestionType enum
   */
  static fromString(value: string): QuestionType | null {
    const normalized = value.toLowerCase().replace(/[-\s]/g, '');

    // Direct mapping for common variations
    const mappings: Record<string, QuestionType> = {
      behavioral: QuestionType.BEHAVIORAL,
      behaviour: QuestionType.BEHAVIORAL,
      behavioural: QuestionType.BEHAVIORAL,
      technical: QuestionType.TECHNICAL,
      tech: QuestionType.TECHNICAL,
      systemdesign: QuestionType.SYSTEM_DESIGN,
      'system-design': QuestionType.SYSTEM_DESIGN,
      system_design: QuestionType.SYSTEM_DESIGN,
      leadership: QuestionType.LEADERSHIP,
      management: QuestionType.LEADERSHIP,
      lead: QuestionType.LEADERSHIP,
      coding: QuestionType.CODING,
      code: QuestionType.CODING,
      programming: QuestionType.CODING,
      algorithm: QuestionType.CODING,
      other: QuestionType.OTHER,
    };

    return mappings[normalized] || null;
  }

  /**
   * Automatically categorize a question based on its content
   */
  static categorizeQuestion(question: string, context?: string): QuestionType {
    const content = `${question} ${context || ''}`.toLowerCase();

    // Score each type based on keyword matches
    const scores: Record<QuestionType, number> = {
      [QuestionType.BEHAVIORAL]: 0,
      [QuestionType.TECHNICAL]: 0,
      [QuestionType.SYSTEM_DESIGN]: 0,
      [QuestionType.LEADERSHIP]: 0,
      [QuestionType.CODING]: 0,
      [QuestionType.OTHER]: 0,
    };

    // Calculate scores based on keywords
    for (const [type, keywords] of Object.entries(QUESTION_TYPE_KEYWORDS)) {
      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          scores[type as QuestionType] += 1;
        }
      }
    }

    // Find the type with the highest score
    let maxScore = 0;
    let bestType = QuestionType.OTHER;

    for (const [type, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestType = type as QuestionType;
      }
    }

    return bestType;
  }

  /**
   * Get valid enum values as array of strings for form options
   */
  static getFormOptions(): Array<{ value: QuestionType; label: string }> {
    return this.getAllTypes().map((type) => ({
      value: type,
      label: this.getDisplayName(type),
    }));
  }

  /**
   * Normalize existing question types for migration
   */
  static normalizeExistingType(existingType: string): QuestionType {
    const normalized = this.fromString(existingType);
    return normalized || QuestionType.OTHER;
  }
}