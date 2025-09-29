// Standardized enum system for question types
// All enum values are lowercase without spaces for consistency

export enum QuestionType {
  HUMAN_RESOURCES = 'humanresources',
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  SYSTEM_DESIGN = 'systemdesign',
  LEADERSHIP = 'leadership',
  CODING = 'coding',
  OTHER = 'other',
}

// Enum for interview states
export enum InterviewState {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
}

// Enum for programming languages and frameworks
export enum ProgrammingLanguage {
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  PYTHON = 'python',
  JAVA = 'java',
  CSHARP = 'csharp',
  CPP = 'cpp',
  C = 'c',
  GO = 'go',
  RUST = 'rust',
  PHP = 'php',
  RUBY = 'ruby',
  KOTLIN = 'kotlin',
  SWIFT = 'swift',
  DART = 'dart',
  SCALA = 'scala',
  REACT = 'react',
  ANGULAR = 'angular',
  VUE = 'vue',
  NODE = 'node',
  SPRING = 'spring',
  DJANGO = 'django',
  FLASK = 'flask',
  DOTNET = 'dotnet',
  LARAVEL = 'laravel',
  RAILS = 'rails',
  OTHER = 'other',
}

// Display names for UI
export const QUESTION_TYPE_DISPLAY: Record<QuestionType, string> = {
  [QuestionType.HUMAN_RESOURCES]: 'Human Resources',
  [QuestionType.TECHNICAL]: 'Technical',
  [QuestionType.BEHAVIORAL]: 'Behavioral',
  [QuestionType.SYSTEM_DESIGN]: 'System Design',
  [QuestionType.LEADERSHIP]: 'Leadership',
  [QuestionType.CODING]: 'Coding',
  [QuestionType.OTHER]: 'Other',
};

// Display names for interview states
export const INTERVIEW_STATE_DISPLAY: Record<InterviewState, string> = {
  [InterviewState.PENDING]: 'Pending',
  [InterviewState.PROCESSING]: 'Processing',
  [InterviewState.COMPLETED]: 'Completed',
};

// Display names for programming languages
export const PROGRAMMING_LANGUAGE_DISPLAY: Record<ProgrammingLanguage, string> =
  {
    [ProgrammingLanguage.JAVASCRIPT]: 'JavaScript',
    [ProgrammingLanguage.TYPESCRIPT]: 'TypeScript',
    [ProgrammingLanguage.PYTHON]: 'Python',
    [ProgrammingLanguage.JAVA]: 'Java',
    [ProgrammingLanguage.CSHARP]: 'C#',
    [ProgrammingLanguage.CPP]: 'C++',
    [ProgrammingLanguage.C]: 'C',
    [ProgrammingLanguage.GO]: 'Go',
    [ProgrammingLanguage.RUST]: 'Rust',
    [ProgrammingLanguage.PHP]: 'PHP',
    [ProgrammingLanguage.RUBY]: 'Ruby',
    [ProgrammingLanguage.KOTLIN]: 'Kotlin',
    [ProgrammingLanguage.SWIFT]: 'Swift',
    [ProgrammingLanguage.DART]: 'Dart',
    [ProgrammingLanguage.SCALA]: 'Scala',
    [ProgrammingLanguage.REACT]: 'React',
    [ProgrammingLanguage.ANGULAR]: 'Angular',
    [ProgrammingLanguage.VUE]: 'Vue.js',
    [ProgrammingLanguage.NODE]: 'Node.js',
    [ProgrammingLanguage.SPRING]: 'Spring Framework',
    [ProgrammingLanguage.DJANGO]: 'Django',
    [ProgrammingLanguage.FLASK]: 'Flask',
    [ProgrammingLanguage.DOTNET]: '.NET',
    [ProgrammingLanguage.LARAVEL]: 'Laravel',
    [ProgrammingLanguage.RAILS]: 'Ruby on Rails',
    [ProgrammingLanguage.OTHER]: 'Other',
  };

// Descriptions for each type
export const QUESTION_TYPE_DESCRIPTIONS: Record<QuestionType, string> = {
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
  [QuestionType.OTHER]: "Questions that don't fit into the standard categories",
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

// Utility functions for programming languages
export class ProgrammingLanguageUtils {
  /**
   * Get all available programming languages
   */
  static getAllLanguages(): ProgrammingLanguage[] {
    return Object.values(ProgrammingLanguage);
  }

  /**
   * Get display name for a programming language
   */
  static getDisplayName(language: ProgrammingLanguage): string {
    return PROGRAMMING_LANGUAGE_DISPLAY[language] || 'Unknown';
  }

  /**
   * Convert string to ProgrammingLanguage enum
   */
  static fromString(value: string): ProgrammingLanguage | null {
    const normalized = value.toLowerCase().replace(/[-\s.#]/g, '');

    // Direct mapping for common variations
    const mappings: Record<string, ProgrammingLanguage> = {
      javascript: ProgrammingLanguage.JAVASCRIPT,
      js: ProgrammingLanguage.JAVASCRIPT,
      typescript: ProgrammingLanguage.TYPESCRIPT,
      ts: ProgrammingLanguage.TYPESCRIPT,
      python: ProgrammingLanguage.PYTHON,
      py: ProgrammingLanguage.PYTHON,
      java: ProgrammingLanguage.JAVA,
      csharp: ProgrammingLanguage.CSHARP,
      'c#': ProgrammingLanguage.CSHARP,
      cpp: ProgrammingLanguage.CPP,
      'c++': ProgrammingLanguage.CPP,
      c: ProgrammingLanguage.C,
      go: ProgrammingLanguage.GO,
      golang: ProgrammingLanguage.GO,
      rust: ProgrammingLanguage.RUST,
      php: ProgrammingLanguage.PHP,
      ruby: ProgrammingLanguage.RUBY,
      rb: ProgrammingLanguage.RUBY,
      kotlin: ProgrammingLanguage.KOTLIN,
      kt: ProgrammingLanguage.KOTLIN,
      swift: ProgrammingLanguage.SWIFT,
      dart: ProgrammingLanguage.DART,
      scala: ProgrammingLanguage.SCALA,
      react: ProgrammingLanguage.REACT,
      reactjs: ProgrammingLanguage.REACT,
      angular: ProgrammingLanguage.ANGULAR,
      angularjs: ProgrammingLanguage.ANGULAR,
      vue: ProgrammingLanguage.VUE,
      vuejs: ProgrammingLanguage.VUE,
      node: ProgrammingLanguage.NODE,
      nodejs: ProgrammingLanguage.NODE,
      spring: ProgrammingLanguage.SPRING,
      springboot: ProgrammingLanguage.SPRING,
      django: ProgrammingLanguage.DJANGO,
      flask: ProgrammingLanguage.FLASK,
      dotnet: ProgrammingLanguage.DOTNET,
      '.net': ProgrammingLanguage.DOTNET,
      laravel: ProgrammingLanguage.LARAVEL,
      rails: ProgrammingLanguage.RAILS,
      rubyonrails: ProgrammingLanguage.RAILS,
      other: ProgrammingLanguage.OTHER,
    };

    return mappings[normalized] || null;
  }

  /**
   * Get valid enum values as array of strings for form options
   */
  static getFormOptions(): Array<{ value: ProgrammingLanguage; label: string }> {
    return this.getAllLanguages().map((language) => ({
      value: language,
      label: this.getDisplayName(language),
    }));
  }

  /**
   * Normalize existing programming language for migration
   */
  static normalizeExistingLanguage(existingLanguage: string): ProgrammingLanguage {
    const normalized = this.fromString(existingLanguage);
    return normalized || ProgrammingLanguage.OTHER;
  }
}