'use client';

import { useState } from 'react';
import { AlertCircle, Save, X, Building2 } from 'lucide-react';
import VideoUploader from '@/components/VideoUploader';

interface VideoInterviewFormData {
  company: string;
}

interface VideoInterviewFormProps {
  onSubmit: (data: VideoInterviewFormData) => Promise<string>; // Returns interview ID
  onCancel: () => void;
}

export default function VideoInterviewForm({
  onSubmit,
  onCancel,
}: VideoInterviewFormProps) {
  const [formData, setFormData] = useState({
    company: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interviewId, setInterviewId] = useState<string>('');
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Handle initial form submission (create interview)
  const handleCreateInterview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const createdInterviewId = await onSubmit({
        company: formData.company.trim(),
      });
      
      setInterviewId(createdInterviewId);
      setShowVideoUpload(true);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle video upload completion
  const handleVideoUploaded = (videoPath: string) => {
    setVideoUploaded(true);
  };

  const handleVideoUploadError = (error: string) => {
    console.error('Video upload error:', error);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Upload Interview Video
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create interview and upload video for automatic processing
        </p>
      </div>

      {!showVideoUpload ? (
        // Step 1: Company Information
        <form onSubmit={handleCreateInterview} className="space-y-6">
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
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                onFocus={() => setFocusedField('company')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
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

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Video Processing Info</p>
                <p>
                  After creating the interview, you'll upload a video that will be automatically processed to extract questions, answers, and analysis.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              <div className="flex items-center justify-center">
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Creating...' : 'Create & Continue'}
              </div>
            </button>
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
          </div>
        </form>
      ) : (
        // Step 2: Video Upload
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Interview created for {formData.company}
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              ID: {interviewId}
            </p>
          </div>

          <VideoUploader
            interviewId={interviewId}
            onVideoUploaded={handleVideoUploaded}
            onUploadStart={() => setIsSubmitting(true)}
            onUploadError={handleVideoUploadError}
            disabled={isSubmitting || videoUploaded}
          />

          {videoUploaded && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                  Video Upload Complete!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Your interview video has been uploaded and is now being processed. The system will automatically extract questions, answers, and provide analysis.
                </p>
                <button
                  onClick={onCancel}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}