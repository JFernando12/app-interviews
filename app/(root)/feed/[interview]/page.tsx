'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Question } from '@/lib/dynamodb';
import { 
  ArrowLeft, 
  Calendar, 
  Building2, 
  User, 
  Code, 
  Tag,
  Globe,
  Video,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye
} from 'lucide-react';
import {
  QUESTION_TYPE_DISPLAY,
  INTERVIEW_STATE_DISPLAY,
  InterviewState,
  QuestionType,
} from '@/types/enums';

interface FeedInterview {
  id: string;
  company: string;
  type?: string;
  programming_language?: string;
  state: InterviewState;
  user_id: string;
  video_path?: string;
  public?: boolean;
  anonymous?: boolean;
  created_at: string;
  updated_at: string;
  user: {
    name: string;
    title: string | null;
    company: string | null;
    avatar: string | null;
  };
}

export default function FeedInterviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params?.interview as string;

  const [interview, setInterview] = useState<FeedInterview | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInterviewDetails();
  }, [interviewId]);

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);

      // Fetch public interview details
      const interviewResponse = await fetch(`/api/feed/${interviewId}`);
      if (!interviewResponse.ok) {
        if (interviewResponse.status === 404) {
          throw new Error('Interview not found or not public');
        }
        throw new Error('Failed to load interview');
      }
      const interviewData = await interviewResponse.json();
      setInterview(interviewData);

      // Fetch questions for this interview
      const questionsResponse = await fetch(
        `/api/questions?interview_id=${interviewId}&public=true`
      );
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData);
      }
    } catch (error) {
      console.error('Error fetching interview details:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                Loading interview details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Interview Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <button
                onClick={() => router.push('/feed')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Feed
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!interview) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <button
          onClick={() => router.push('/feed')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Community Feed
        </button>

        {/* Interview Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {interview.company}
                </h1>
                <div className="flex items-center gap-3">
                  {/* State badge */}
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      interview.state === InterviewState.COMPLETED
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : interview.state === InterviewState.PROCESSING
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {interview.state === InterviewState.COMPLETED && (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {interview.state === InterviewState.PROCESSING && (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    {interview.state === InterviewState.PENDING && (
                      <AlertCircle className="h-4 w-4 mr-2" />
                    )}
                    {INTERVIEW_STATE_DISPLAY[interview.state]}
                  </span>

                  {/* Public badge */}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    <Globe className="h-4 w-4 mr-2" />
                    Public
                  </span>

                  {/* Video indicator */}
                  {interview.video_path && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </span>
                  )}

                  {/* Anonymous badge */}
                  {interview.anonymous && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      Anonymous
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Interview metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              {/* User info */}
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <User className="w-5 h-5 mr-3" />
                <div>
                  <span className="font-medium">{interview.user.name}</span>
                  {interview.user.company && !interview.anonymous && (
                    <>
                      <span className="mx-2">at</span>
                      <span className="font-medium">
                        {interview.user.company}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Creation date */}
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5 mr-3" />
                <span>Created {formatDate(interview.created_at)}</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Programming language */}
              {interview.programming_language && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Code className="w-5 h-5 mr-3" />
                  <span>{interview.programming_language}</span>
                </div>
              )}

              {/* Interview type */}
              {interview.type && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Tag className="w-5 h-5 mr-3" />
                  <span>
                    {QUESTION_TYPE_DISPLAY[interview.type as QuestionType] ||
                      interview.type}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Interview Questions
            </h2>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Eye className="w-4 h-4 mr-2" />
              {questions.length} question{questions.length !== 1 ? 's' : ''}
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Questions Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This interview doesn't have any public questions yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Question {index + 1}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                        {QUESTION_TYPE_DISPLAY[question.type]}
                      </span>
                      {question.programming_language && (
                        <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
                          {question.programming_language}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Question:
                      </h4>
                      <p className="text-gray-900 dark:text-white leading-relaxed">
                        {question.question}
                      </p>
                    </div>

                    {question.context && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Context:
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {question.context}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Answer:
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                        <p className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                          {question.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This interview was shared publicly by the community to help others
            learn and prepare.
          </p>
        </div>
      </div>
    </div>
  );
}