'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle,
  Video,
} from 'lucide-react';
import {
  QuestionType,
  QuestionTypeUtils,
  ProgrammingLanguage,
  PROGRAMMING_LANGUAGE_DISPLAY,
} from '@/types/enums';

export interface QuestionData {
  context: string;
  question: string;
  answer: string;
  type?: QuestionType;
  programming_language?: string;
}

interface QuestionUploaderProps {
  onQuestionsChange: (questions: QuestionData[]) => void;
  onVideoUpload?: (file: File) => void; // New callback for video upload
  defaultType?: QuestionType;
  defaultProgrammingLanguage?: string;
}

export default function QuestionUploader({
  onQuestionsChange,
  onVideoUpload,
  defaultType = QuestionType.TECHNICAL,
  defaultProgrammingLanguage = '',
}: QuestionUploaderProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'file' | 'manual'>(
    'video'
  );
  const [questions, setQuestions] = useState<QuestionData[]>([
    {
      context: '',
      question: '',
      answer: '',
      type: defaultType,
      programming_language: defaultProgrammingLanguage,
    },
  ]);
  const [fileError, setFileError] = useState<string>('');
  const [fileSuccess, setFileSuccess] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoError, setVideoError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Update parent component when questions change
  const updateQuestions = (newQuestions: QuestionData[]) => {
    setQuestions(newQuestions);
    onQuestionsChange(
      newQuestions.filter(
        (q) => q.question.trim() && q.answer.trim() && q.context.trim()
      )
    );
  };

  // Handle manual question input changes
  const handleQuestionChange = (
    index: number,
    field: keyof QuestionData,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    updateQuestions(newQuestions);
  };

  // Add new question row
  const addQuestion = () => {
    const newQuestions = [
      ...questions,
      {
        context: '',
        question: '',
        answer: '',
        type: defaultType,
        programming_language: defaultProgrammingLanguage,
      },
    ];
    updateQuestions(newQuestions);
  };

  // Remove question row
  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      updateQuestions(newQuestions);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError('');
    setFileSuccess('');

    if (file.type !== 'application/json') {
      setFileError('Please select a JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedQuestions = JSON.parse(content);

        // Validate JSON structure
        if (!Array.isArray(parsedQuestions)) {
          throw new Error('JSON must be an array of questions');
        }

        const validQuestions: QuestionData[] = [];

        parsedQuestions.forEach((item, index) => {
          if (typeof item !== 'object' || item === null) {
            throw new Error(`Question ${index + 1}: Must be an object`);
          }

          const { context, question, answer, type, programming_language } =
            item;

          if (!context || !question || !answer) {
            throw new Error(
              `Question ${
                index + 1
              }: Missing required fields (context, question, answer)`
            );
          }

          if (
            typeof context !== 'string' ||
            typeof question !== 'string' ||
            typeof answer !== 'string'
          ) {
            throw new Error(
              `Question ${
                index + 1
              }: context, question, and answer must be strings`
            );
          }

          validQuestions.push({
            context: context.trim(),
            question: question.trim(),
            answer: answer.trim(),
            type:
              QuestionTypeUtils.fromString(type) ||
              defaultType ||
              QuestionType.OTHER,
            programming_language:
              programming_language || defaultProgrammingLanguage,
          });
        });

        if (validQuestions.length === 0) {
          throw new Error('No valid questions found in the file');
        }

        updateQuestions(validQuestions);
        setFileSuccess(
          `Successfully loaded ${validQuestions.length} questions from file`
        );
        setActiveTab('manual'); // Switch to manual tab to show loaded questions
      } catch (error) {
        console.error('File parsing error:', error);
        setFileError(
          error instanceof Error ? error.message : 'Failed to parse JSON file'
        );
      }
    };

    reader.readAsText(file);
  };

  // Clear file input
  const clearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileError('');
    setFileSuccess('');
  };

  // Handle video upload
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setVideoError('');

    // Validate video file type
    const allowedTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'video/x-matroska',
    ];
    if (!allowedTypes.includes(file.type)) {
      setVideoError(
        'Please select a valid video file (MP4, MOV, AVI, WebM, MPEG, MKV)'
      );
      return;
    }

    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      setVideoError('File size must be less than 500MB');
      return;
    }

    setVideoFile(file);
    if (onVideoUpload) {
      onVideoUpload(file);
    }
  };

  // Clear video input
  const clearVideo = () => {
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
    setVideoFile(null);
    setVideoError('');
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Add Questions (Optional)
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
          You can add questions manually, upload a JSON file, or upload an
          interview video for automatic processing.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-600">
        <nav className="-mb-px flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`whitespace-nowrap py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors flex-shrink-0 ${
              activeTab === 'video'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Video className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Video Upload</span>
            <span className="xs:hidden">Video</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`whitespace-nowrap py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors flex-shrink-0 ${
              activeTab === 'file'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Upload className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
            <span className="hidden xs:inline">JSON File Upload</span>
            <span className="xs:hidden">JSON</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`whitespace-nowrap py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors flex-shrink-0 ${
              activeTab === 'manual'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Manual Entry</span>
            <span className="xs:hidden">Manual</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'manual' && (
        <div className="space-y-3 sm:space-y-4">
          {questions.map((question, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                  Question {index + 1}
                </h4>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Context *
                  </label>
                  <input
                    type="text"
                    value={question.context}
                    onChange={(e) =>
                      handleQuestionChange(index, 'context', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    placeholder="e.g., Behavioral, Technical, etc."
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={question.type || ''}
                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        'type',
                        e.target.value as QuestionType
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="">Select type...</option>
                    {QuestionTypeUtils.getFormOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Programming Language
                </label>
                <select
                  value={question.programming_language || ''}
                  onChange={(e) =>
                    handleQuestionChange(
                      index,
                      'programming_language',
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="">Select language...</option>
                  {Object.values(ProgrammingLanguage).map((language) => (
                    <option key={language} value={language}>
                      {PROGRAMMING_LANGUAGE_DISPLAY[language]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question *
                </label>
                <textarea
                  value={question.question}
                  onChange={(e) =>
                    handleQuestionChange(index, 'question', e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm resize-y"
                  placeholder="Enter the interview question..."
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Answer *
                </label>
                <textarea
                  value={question.answer}
                  onChange={(e) =>
                    handleQuestionChange(index, 'answer', e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm resize-y"
                  placeholder="Enter the expected answer..."
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 sm:mb-2" />
            <span className="text-sm sm:text-base">Add Another Question</span>
          </button>
        </div>
      )}

      {activeTab === 'file' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-6 text-center">
            <FileText className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Upload a JSON file with your questions
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                Choose JSON File
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Expected format: [{'{'}"context":"...", "question":"...",
                "answer":"..."{'}'}]
              </p>
            </div>
          </div>

          {fileError && (
            <div className="flex items-start p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">
                  {fileError}
                </p>
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 mt-1"
                >
                  Clear and try again
                </button>
              </div>
            </div>
          )}

          {fileSuccess && (
            <div className="flex items-start p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-green-800 dark:text-green-200">
                {fileSuccess}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'video' && (
        <div className="space-y-3 sm:space-y-4">
          {!videoFile && (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-6 text-center">
              <Video className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Upload an interview video for automatic processing
                </p>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm,video/x-matroska,.mp4,.mov,.avi,.webm,.mpeg,.mkv"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Choose Video File
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Supported formats: MP4, MOV, AVI, WebM, MPEG, MKV (Max 500MB)
                </p>
              </div>
            </div>
          )}

          {videoFile && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <Video className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {videoFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(videoFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearVideo}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {videoError && (
            <div className="flex items-start p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">
                  {videoError}
                </p>
                <button
                  type="button"
                  onClick={clearVideo}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 mt-1 underline"
                >
                  Clear and try again
                </button>
              </div>
            </div>
          )}

          {videoFile && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-200">
                    Video Ready for Upload
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    The video will be processed automatically after creating the
                    interview to extract questions and answers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {questions.length > 0 &&
        questions.some(
          (q) => q.question.trim() && q.answer.trim() && q.context.trim()
        ) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 mt-4">
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              {
                questions.filter(
                  (q) =>
                    q.question.trim() && q.answer.trim() && q.context.trim()
                ).length
              }{' '}
              question(s) ready to be added to the interview
            </p>
          </div>
        )}
    </div>
  );
}