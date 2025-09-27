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
      });
    } else {
      setFormData({
        question: '',
        answer: '',
        context: '',
      });
    }
    setErrors({});
  }, [initialData]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
    const limits = {
      question: 500,
      answer: 1000,
      context: 300,
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
