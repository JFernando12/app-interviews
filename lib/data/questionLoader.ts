import { Question } from '@/lib/types';

export class StaticQuestionLoader {
  private static cache: Map<string, Question[]> = new Map();

  static async loadTechnicalQuestions(language: string): Promise<Question[]> {
    const cacheKey = `technical-${language}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const questionModule = await import(
        `@/lib/data/questions/technical/${language}.json`
      );
      const questions: Question[] = questionModule.default;
      this.cache.set(cacheKey, questions);
      return questions;
    } catch (error) {
      console.error(`Failed to load questions for ${language}:`, error);
      return [];
    }
  }
}

export class QuestionUtils {
  static searchQuestions(
    questions: Question[],
    searchTerm: string,
  ): Question[] {
    if (!searchTerm.trim()) return questions;

    const term = searchTerm.toLowerCase();
    return questions.filter(
      (q) =>
        q.question.toLowerCase().includes(term) ||
        q.answer.toLowerCase().includes(term) ||
        (q.context && q.context.toLowerCase().includes(term)),
    );
  }
}

export interface TechnicalQuestion extends Question {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}
