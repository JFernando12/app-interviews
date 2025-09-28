'use client';

import { useState, useEffect } from 'react';
import { Interview } from '@/lib/dynamodb';
import {
  QuestionType,
  InterviewState,
  QUESTION_TYPE_DISPLAY,
  INTERVIEW_STATE_DISPLAY,
} from '@/types/enums';
import { AlertCircle, Save, X, Video } from 'lucide-react';
import QuestionUploader, { QuestionData } from '@/components/QuestionUploader';
import VideoUploader from '@/components/VideoUploader';

interface InterviewFormData {
  company: string;
  programming_language?: string;
  type?: QuestionType;
  state?: InterviewState;
  questions: QuestionData[];
  video_path?: string;
  videoFile?: File; // Add video file property
}

interface InterviewFormProps {
  initialData?: Interview;
  onSubmit: (data: InterviewFormData) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit' | 'video'; // New mode for video upload workflow
}

export default function InterviewForm({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
}: InterviewFormProps) {
  const [formData, setFormData] = useState({
    company: '',
    programming_language: '',
    type: '' as QuestionType | '',
    state: InterviewState.PENDING,
  });
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [videoPath, setVideoPath] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null); // Store the video file
  const [showVideoUpload, setShowVideoUpload] = useState(mode === 'video');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        company: initialData.company,
        programming_language: initialData.programming_language || '',
        type: initialData.type || '',
        state: initialData.state || InterviewState.PENDING,
      });
      setVideoPath(initialData.video_path || '');
    } else {
      setFormData({
        company: '',
        programming_language: '',
        type: '',
        state: InterviewState.PENDING,
      });
      setVideoPath('');
    }
    setErrors({});
  }, [initialData]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle video upload
  const handleVideoUploaded = (path: string) => {
    setVideoPath(path);
    setShowVideoUpload(false);
  };

  // Handle video file selection from QuestionUploader
  const handleVideoFileSelected = (file: File) => {
    setVideoFile(file);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    } else if (formData.company.length < 2) {
      newErrors.company = 'Company name must be at least 2 characters';
    } else if (formData.company.length > 100) {
      newErrors.company = 'Company name must be less than 100 characters';
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
      const submissionData: InterviewFormData = {
        company: formData.company.trim(),
        questions: questions,
      };

      // Add video file if selected
      if (videoFile) {
        submissionData.videoFile = videoFile;
      }

      // Add optional fields if provided
      if (formData.programming_language) {
        submissionData.programming_language = formData.programming_language;
      }
      if (formData.type) {
        submissionData.type = formData.type as QuestionType;
      }
      if (mode === 'edit' && formData.state) {
        submissionData.state = formData.state;
      }
      if (videoPath) {
        submissionData.video_path = videoPath;
      }

      onSubmit(submissionData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {initialData ? 'Edit Interview' : 'Create New Interview'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {initialData
            ? 'Update interview details'
            : 'Add a new interview to track'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Field */}
        <div>
          <label
            htmlFor="company"
            className={`block text-sm font-medium mb-2 transition-colors ${
              focusedField === 'company'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Company Name *
          </label>
          <div className="relative">
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              onFocus={() => setFocusedField('company')}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.company
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
              placeholder="Enter company name..."
              disabled={isSubmitting}
            />
            {errors.company && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.company && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.company}
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
            Programming Language
          </label>
          <input
            type="text"
            id="programming_language"
            name="programming_language"
            value={formData.programming_language}
            onChange={handleChange}
            onFocus={() => setFocusedField('programming_language')}
            onBlur={() => setFocusedField(null)}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
            placeholder="e.g., JavaScript, Python, Java..."
            disabled={isSubmitting}
          />
        </div>

        {/* Question Type Field */}
        <div>
          <label
            htmlFor="type"
            className={`block text-sm font-medium mb-2 transition-colors ${
              focusedField === 'type'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Interview Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            onFocus={() => setFocusedField('type')}
            onBlur={() => setFocusedField(null)}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            disabled={isSubmitting}
          >
            <option value="">Select type...</option>
            {Object.values(QuestionType).map((type) => (
              <option key={type} value={type}>
                {QUESTION_TYPE_DISPLAY[type]}
              </option>
            ))}
          </select>
        </div>

        {/* Interview State Field - Only show in edit mode */}
        {mode === 'edit' && (
          <div>
            <label
              htmlFor="state"
              className={`block text-sm font-medium mb-2 transition-colors ${
                focusedField === 'state'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Interview State
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              onFocus={() => setFocusedField('state')}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              disabled={isSubmitting}
            >
              {Object.values(InterviewState).map((state) => (
                <option key={state} value={state}>
                  {INTERVIEW_STATE_DISPLAY[state]}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Video Upload Section */}
        {(mode === 'video' || showVideoUpload) && initialData?.id && (
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <VideoUploader
              interviewId={initialData.id}
              onVideoUploaded={handleVideoUploaded}
              onUploadStart={() => setIsSubmitting(true)}
              onUploadError={() => setIsSubmitting(false)}
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* Video Upload Toggle Button */}
        {mode !== 'video' &&
          initialData?.id &&
          !videoPath &&
          !showVideoUpload && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowVideoUpload(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <Video className="h-4 w-4 mr-2" />
                Add Video Upload
              </button>
            </div>
          )}

        {/* Video Status */}
        {videoPath && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center">
              <Video className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Video uploaded successfully
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 break-all">
              {videoPath}
            </p>
          </div>
        )}

        {/* Question Upload Section - Only show for new interviews */}
        {!initialData && (
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <QuestionUploader
              onQuestionsChange={setQuestions}
              onVideoUpload={handleVideoFileSelected}
              defaultType={QuestionType.TECHNICAL}
              defaultProgrammingLanguage="JavaScript"
            />
          </div>
        )}

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
                ? 'Update Interview'
                : 'Create Interview'}
            </div>
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
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