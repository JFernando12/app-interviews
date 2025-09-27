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
      });
    } else {
      setFormData({
        question: '',
        answer: '',
        context: '',
        type: '',
        programming_language: '',
        interview_id: '',
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

    if (!formData.interview_id.trim()) {
      newErrors.interview_id = 'Interview ID is required';
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
      await onSubmit(formData);
      if (!initialData) {
        // Reset form if creating new question
        setFormData({
          question: '',
          answer: '',
          context: '',
          type: '',
          programming_language: '',
          interview_id: '',
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
    return formData[fieldName].length;
  };

  const getCharacterLimit = (fieldName: keyof typeof formData) => {
    const limits: Record<keyof typeof formData, number> = {
      question: 500,
      answer: 1000,
      context: 300,
      type: 50,
      programming_language: 50,
      interview_id: 36,
    };
    return limits[fieldName];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Question Field */}
        <div className="space-y-2">
          <label
            htmlFor="question"
            className="block text-sm font-semibold text-on-card"
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
              className={`textarea-field resize-none ${
                errors.question
                  ? 'border-red-300 focus:border-red-500'
                  : 'focus:border-indigo-500'
              } ${focusedField === 'question' ? 'ring-2 ring-indigo-200' : ''}`}
              rows={3}
              maxLength={getCharacterLimit('question')}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {getCharacterCount('question')}/{getCharacterLimit('question')}
            </div>
          </div>
          {errors.question && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errors.question}
            </div>
          )}
        </div>

        {/* Answer Field */}
        <div className="space-y-2">
          <label
            htmlFor="answer"
            className="block text-sm font-semibold text-on-card"
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
              className={`textarea-field ${
                errors.answer
                  ? 'border-red-300 focus:border-red-500'
                  : 'focus:border-indigo-500'
              } ${focusedField === 'answer' ? 'ring-2 ring-indigo-200' : ''}`}
              rows={5}
              maxLength={getCharacterLimit('answer')}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {getCharacterCount('answer')}/{getCharacterLimit('answer')}
            </div>
          </div>
          {errors.answer && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errors.answer}
            </div>
          )}
        </div>

        {/* Context Field */}
        <div className="space-y-2">
          <label
            htmlFor="context"
            className="block text-sm font-semibold text-on-card"
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
              className={`textarea-field resize-none ${
                errors.context
                  ? 'border-red-300 focus:border-red-500'
                  : 'focus:border-indigo-500'
              } ${focusedField === 'context' ? 'ring-2 ring-indigo-200' : ''}`}
              rows={3}
              maxLength={getCharacterLimit('context')}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {getCharacterCount('context')}/{getCharacterLimit('context')}
            </div>
          </div>
          {errors.context && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errors.context}
            </div>
          )}
        </div>

        {/* Type Field */}
        <div className="space-y-2">
          <label
            htmlFor="type"
            className="block text-sm font-semibold text-on-card"
          >
            Question Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            onFocus={() => handleFocus('type')}
            onBlur={handleBlur}
            className={`form-field ${
              errors.type
                ? 'border-red-300 focus:border-red-500'
                : 'focus:border-indigo-500'
            } ${focusedField === 'type' ? 'ring-2 ring-indigo-200' : ''}`}
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
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errors.type}
            </div>
          )}
        </div>

        {/* Programming Language Field */}
        <div className="space-y-2">
          <label
            htmlFor="programming_language"
            className="block text-sm font-semibold text-on-card"
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
              className={`form-field ${
                errors.programming_language
                  ? 'border-red-300 focus:border-red-500'
                  : 'focus:border-indigo-500'
              } ${
                focusedField === 'programming_language'
                  ? 'ring-2 ring-indigo-200'
                  : ''
              }`}
              maxLength={getCharacterLimit('programming_language')}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {getCharacterCount('programming_language')}/
              {getCharacterLimit('programming_language')}
            </div>
          </div>
          {errors.programming_language && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errors.programming_language}
            </div>
          )}
        </div>

        {/* Interview ID Field */}
        <div className="space-y-2">
          <label
            htmlFor="interview_id"
            className="block text-sm font-semibold text-on-card"
          >
            Interview ID *
          </label>
          <div className="relative">
            <input
              type="text"
              id="interview_id"
              name="interview_id"
              value={formData.interview_id}
              onChange={handleChange}
              onFocus={() => handleFocus('interview_id')}
              onBlur={handleBlur}
              placeholder="Interview ID (UUID)"
              className={`form-field ${
                errors.interview_id
                  ? 'border-red-300 focus:border-red-500'
                  : 'focus:border-indigo-500'
              } ${
                focusedField === 'interview_id' ? 'ring-2 ring-indigo-200' : ''
              }`}
              maxLength={getCharacterLimit('interview_id')}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {getCharacterCount('interview_id')}/
              {getCharacterLimit('interview_id')}
            </div>
          </div>
          {errors.interview_id && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errors.interview_id}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="btn btn-secondary"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <div className="loading-spinner w-4 h-4 border-white/30 border-t-white" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting
              ? 'Saving...'
              : initialData
              ? 'Update Question'
              : 'Create Question'}
          </button>
        </div>
      </form>
    </div>
  );
}
