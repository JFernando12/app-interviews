import { QuestionType, InterviewState } from '@/types/enums';

export interface Question {
  id: string;
  question: string;
  context: string;
  answer: string;
  type: QuestionType;
  programming_language: string;
  interview_id?: string;
  user_id?: string;
  global: boolean;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  company: string;
  type?: QuestionType;
  programming_language?: string;
  state: InterviewState;
  user_id: string;
  video_path?: string;
  public?: boolean;
  anonymous?: boolean;
  created_at: string;
  updated_at: string;
}
