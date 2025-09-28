'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Question, Interview } from '@/lib/dynamodb';
import { ArrowLeft, Calendar, Building2 } from 'lucide-react';

export default function InterviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const interviewId = params?.id as string;

  const [interview, setInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchInterviewDetails();
  }, [session, status, interviewId]);

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);

      // Fetch interview details
      const interviewResponse = await fetch(`/api/interviews/${interviewId}`);
      if (!interviewResponse.ok) {
        throw new Error('Interview not found');
      }
      const interviewData = await interviewResponse.json();
      setInterview(interviewData);

      // Fetch questions for this interview
      const questionsResponse = await fetch(
        `/api/questions?interview_id=${interviewId}`
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => router.push('/interviews')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Interviews
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <button
          onClick={() => router.push('/interviews')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Interviews
        </button>

        {/* Interview Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Interview Details
              </h1>
              {interview && (
                <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    <span>{interview.company}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>
                      {new Date(interview.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Questions ({questions.length})
          </h2>

          {questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No questions found for this interview.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Question {index + 1}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                      {question.type}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Question:
                      </h4>
                      <p className="text-gray-900 dark:text-white">
                        {question.question}
                      </p>
                    </div>
                    {question.context && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Context:
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {question.context}
                        </p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Answer:
                      </h4>
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {question.answer}
                      </p>
                    </div>
                    {question.programming_language && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Programming Language:
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {question.programming_language}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
