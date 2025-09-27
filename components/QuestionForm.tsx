'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/lib/dynamodb';

interface QuestionFormProps {
  initialData?: Question;
  onSubmit: (data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
}

export default function QuestionForm({ initialData, onSubmit, onCancel }: QuestionFormProps) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    context: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    } else if (formData.question.length < 5) {
      newErrors.question = 'Question must be at least 5 characters long';
    }

    if (!formData.answer.trim()) {
      newErrors.answer = 'Answer is required';
    } else if (formData.answer.length < 5) {
      newErrors.answer = 'Answer must be at least 5 characters long';
    }

    if (!formData.context.trim()) {
      newErrors.context = 'Context is required';
    } else if (formData.context.length < 10) {
      newErrors.context = 'Context must be at least 10 characters long';
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
    } else {
      // Reset form
      setFormData({
        question: '',
        answer: '',
        context: '',
      });
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
          Question *
        </label>
        <input
          type="text"
          id="question"
          name="question"
          value={formData.question}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            errors.question ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your question"
        />
        {errors.question && (
          <p className="text-red-500 text-xs mt-1">{errors.question}</p>
        )}
      </div>

      <div>
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
          Answer *
        </label>
        <textarea
          id="answer"
          name="answer"
          value={formData.answer}
          onChange={handleChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            errors.answer ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter the answer"
        />
        {errors.answer && (
          <p className="text-red-500 text-xs mt-1">{errors.answer}</p>
        )}
      </div>

      <div>
        <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-1">
          Context *
        </label>
        <textarea
          id="context"
          name="context"
          value={formData.context}
          onChange={handleChange}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            errors.context ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter additional context or background information"
        />
        {errors.context && (
          <p className="text-red-500 text-xs mt-1">{errors.context}</p>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Question' : 'Add Question'}
        </button>
        
        {(initialData || formData.question || formData.answer || formData.context) && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {initialData ? 'Cancel Edit' : 'Clear'}
          </button>
        )}
      </div>
    </form>
  );
}