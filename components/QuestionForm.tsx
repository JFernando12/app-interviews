'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/lib/dynamodb';
import { AlertCircle, Save, X } from 'lucide-react';

interface QuestionFormProps {
  initialData?: Question;
  onSubmit: (data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
}

export default function QuestionForm({
  initialData,
  onSubmit,
  onCancel,
}: QuestionFormProps) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    context: '',
    type: '',
    programming_language: '',
    interview_id: '',
    userId: '',
    global: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        question: initialData.question,
        answer: initialData.answer,
        context: initialData.context,
        type: initialData.type || '',
        programming_language: initialData.programming_language || '',
        interview_id: initialData.interview_id || '',
        userId: initialData.userId || '',
        global: initialData.global || false,
      });
    } else {
      setFormData({
        question: '',
        answer: '',
        context: '',
        type: '',
        programming_language: '',
        interview_id: '',
        userId: '',
        global: false,
      });
    }
    setErrors({});
  }, [initialData]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    } else if (formData.question.trim().length < 10) {
      newErrors.question = 'Question must be at least 10 characters long';
    }

    if (!formData.answer.trim()) {
      newErrors.answer = 'Answer is required';
    } else if (formData.answer.trim().length < 10) {
      newErrors.answer = 'Answer must be at least 10 characters long';
    }

    if (!formData.context.trim()) {
      newErrors.context = 'Context is required';
    } else if (formData.context.trim().length < 5) {
      newErrors.context = 'Context must be at least 5 characters long';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Question type is required';
    }

    if (!formData.programming_language.trim()) {
      newErrors.programming_language = 'Programming language is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        global: true, // Set as global question since it's created through the questions page
        interview_id: undefined, // Remove interview_id for global questions
        userId: undefined, // Let the API handle the userId
      };
      await onSubmit(submissionData);
      if (!initialData) {
        // Reset form if creating new question
        setFormData({
          question: '',
          answer: '',
          context: '',
          type: '',
          programming_language: '',
          interview_id: '',
          userId: '',
          global: false,
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const getCharacterCount = (fieldName: keyof typeof formData) => {
    const value = formData[fieldName];
    return typeof value === 'string' ? value.length : 0;
  };

  const getCharacterLimit = (fieldName: keyof typeof formData) => {
    const limits: Record<string, number> = {
      question: 500,
      answer: 1000,
      context: 300,
      type: 50,
      programming_language: 50,
      interview_id: 36,
      userId: 36,
    };
    return limits[fieldName] || 0;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {initialData ? 'Edit Question' : 'Create New Question'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {initialData
            ? 'Update question details and answers'
            : 'Add a new question to your collection'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Field */}
        <div>
          <label
            htmlFor="question"
            className={`block text-sm font-medium mb-2 transition-colors ${
              focusedField === 'question'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Interview Question *
          </label>
          <div className="relative">
            <textarea
              id="question"
              name="question"
              value={formData.question}
              onChange={handleChange}
              onFocus={() => handleFocus('question')}
              onBlur={handleBlur}
              placeholder="Enter the interview question..."
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 resize-none ${
                errors.question
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
              rows={3}
              maxLength={getCharacterLimit('question')}
              disabled={isSubmitting}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
              {getCharacterCount('question')}/{getCharacterLimit('question')}
            </div>
            {errors.question && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.question && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.question}
            </p>
          )}
        </div>

        {/* Answer Field */}
        <div>
          <label
            htmlFor="answer"
            className={`block text-sm font-medium mb-2 transition-colors ${
              focusedField === 'answer'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Expected Answer / Key Points *
          </label>
          <div className="relative">
            <textarea
              id="answer"
              name="answer"
              value={formData.answer}
              onChange={handleChange}
              onFocus={() => handleFocus('answer')}
              onBlur={handleBlur}
              placeholder="Describe the ideal answer or key points to look for..."
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.answer
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
              rows={5}
              maxLength={getCharacterLimit('answer')}
              disabled={isSubmitting}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
              {getCharacterCount('answer')}/{getCharacterLimit('answer')}
            </div>
            {errors.answer && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.answer && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.answer}
            </p>
          )}
        </div>

        {/* Context Field */}
        <div>
          <label
            htmlFor="context"
            className={`block text-sm font-medium mb-2 transition-colors ${
              focusedField === 'context'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Context / Notes *
          </label>
          <div className="relative">
            <textarea
              id="context"
              name="context"
              value={formData.context}
              onChange={handleChange}
              onFocus={() => handleFocus('context')}
              onBlur={handleBlur}
              placeholder="Add context, role type, difficulty level, or additional notes..."
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 resize-none ${
                errors.context
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
              rows={3}
              maxLength={getCharacterLimit('context')}
              disabled={isSubmitting}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
              {getCharacterCount('context')}/{getCharacterLimit('context')}
            </div>
            {errors.context && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.context && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.context}
            </p>
          )}
        </div>

        {/* Type Field */}
        <div>
          <label
            htmlFor="type"
            className={`block text-sm font-medium mb-2 transition-colors ${
              focusedField === 'type'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Question Type *
          </label>
          <div className="relative">
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              onFocus={() => handleFocus('type')}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.type
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              disabled={isSubmitting}
            >
              <option value="">Select question type...</option>
              <option value="behavioral">Behavioral</option>
              <option value="technical">Technical</option>
              <option value="system-design">System Design</option>
              <option value="leadership">Leadership</option>
              <option value="coding">Coding</option>
              <option value="other">Other</option>
            </select>
            {errors.type && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.type && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.type}
            </p>
          )}
        </div>

        {/* Programming Language Field */}
        <div>
          <label
            htmlFor="programming_language"
            className={`block text-sm font-medium mb-2 transition-colors ${
              focusedField === 'programming_language'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Programming Language *
          </label>
          <div className="relative">
            <input
              type="text"
              id="programming_language"
              name="programming_language"
              value={formData.programming_language}
              onChange={handleChange}
              onFocus={() => handleFocus('programming_language')}
              onBlur={handleBlur}
              placeholder="e.g., JavaScript, Python, Java, etc."
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.programming_language
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
              maxLength={getCharacterLimit('programming_language')}
              disabled={isSubmitting}
            />
            {errors.programming_language && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.programming_language && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.programming_language}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <div className="flex items-center justify-center">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting
                ? 'Saving...'
                : initialData
                ? 'Update Question'
                : 'Create Question'}
            </div>
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              <div className="flex items-center justify-center">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </div>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
