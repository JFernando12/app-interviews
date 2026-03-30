import { QuestionType } from '@/types/enums';

export interface Question {
  id: string;
  question: string;
  context: string;
  answer: string;
  type: QuestionType;
  programming_language: string;
}
