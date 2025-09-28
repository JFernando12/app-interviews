import { NextRequest, NextResponse } from 'next/server';
import { questionsService } from '@/lib/dynamodb';
import { auth } from '@/auth';
import { QuestionType, QuestionTypeUtils } from '@/types/enums';

// POST /api/questions/bulk - Create multiple questions
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { questions, interview_id } = body;

    // Validate required fields
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Questions array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!interview_id) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    // Validate each question
    const validationErrors: string[] = [];
    questions.forEach((question, index) => {
      const {
        question: questionText,
        answer,
        context,
        type,
        programming_language,
      } = question;

      if (!questionText || !answer || !context) {
        validationErrors.push(
          `Question ${
            index + 1
          }: Missing required fields (question, answer, context)`
        );
      }

      if (!type) {
        validationErrors.push(`Question ${index + 1}: Type is required`);
      }

      if (!programming_language) {
        validationErrors.push(
          `Question ${index + 1}: Programming language is required`
        );
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation errors', details: validationErrors },
        { status: 400 }
      );
    }

    // Create all questions
    const createdQuestions = [];
    const errors = [];

    for (let i = 0; i < questions.length; i++) {
      try {
        const questionData = questions[i];
        // Normalize the type
        const normalizedType =
          QuestionTypeUtils.fromString(questionData.type) || QuestionType.OTHER;

        const newQuestion = await questionsService.createQuestion({
          question: questionData.question,
          answer: questionData.answer,
          context: questionData.context,
          type: normalizedType,
          programming_language: questionData.programming_language,
          interview_id: interview_id,
          user_id: session.user.id,
          global: false, // Bulk questions are always user-specific
        });
        createdQuestions.push(newQuestion);
      } catch (error) {
        console.error(`Error creating question ${i + 1}:`, error);
        errors.push(
          `Failed to create question ${i + 1}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    // Return results
    const response: any = {
      created: createdQuestions.length,
      failed: errors.length,
      total: questions.length,
      questions: createdQuestions,
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    return NextResponse.json(response, {
      status: errors.length === questions.length ? 500 : 201,
    });
  } catch (error) {
    console.error('Error creating bulk questions:', error);
    return NextResponse.json(
      { error: 'Failed to create questions' },
      { status: 500 }
    );
  }
}