import { NextRequest, NextResponse } from 'next/server';
import { questionsService } from '@/lib/dynamodb';
import { auth } from '@/auth';
import { QuestionType, QuestionTypeUtils } from '@/types/enums';

// POST /api/questions/bulk - Create multiple questions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questions, interview_id, global = false } = body;

    // For global questions, no authentication required
    // For user-specific questions, authentication is required
    let session = null;
    if (!global) {
      session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Validate required fields
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Questions array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Interview ID is only required for non-global questions
    if (!global && !interview_id) {
      return NextResponse.json(
        { error: 'Interview ID is required for user-specific questions' },
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

      if (!questionText || !answer) {
        validationErrors.push(
          `Question ${index + 1}: Missing required fields (question, answer)`
        );
      }

      // For non-global questions, validate additional fields
      if (!global) {
        if (!context) {
          validationErrors.push(
            `Question ${
              index + 1
            }: Context is required for user-specific questions`
          );
        }
        if (!type) {
          validationErrors.push(
            `Question ${
              index + 1
            }: Type is required for user-specific questions`
          );
        }
        if (!programming_language) {
          validationErrors.push(
            `Question ${
              index + 1
            }: Programming language is required for user-specific questions`
          );
        }
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
        // Normalize the type - use TECHNICAL as default for global questions
        const normalizedType = questionData.type
          ? QuestionTypeUtils.fromString(questionData.type) ||
            QuestionType.TECHNICAL
          : QuestionType.TECHNICAL;

        let questionPayload;
        if (global) {
          // Create global question
          questionPayload = {
            question: questionData.question,
            answer: questionData.answer,
            context: questionData.context || '',
            type: normalizedType,
            programming_language: questionData.programming_language || 'python',
            global: true,
          };
        } else {
          // Create user-specific question
          questionPayload = {
            question: questionData.question,
            answer: questionData.answer,
            context: questionData.context,
            type: normalizedType,
            programming_language: questionData.programming_language,
            interview_id: interview_id,
            user_id: session!.user.id,
            global: false,
          };
        }

        const newQuestion = await questionsService.createQuestion(
          questionPayload
        );
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