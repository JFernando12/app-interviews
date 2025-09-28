'use client';

import { Interview } from '@/lib/dynamodb';
import {
  Building2,
  Calendar,
  Code,
  Tag,
  Clock,
  Video,
  CheckCircle,
  AlertCircle,
  User,
  Eye,
} from 'lucide-react';
import {
  QUESTION_TYPE_DISPLAY,
  INTERVIEW_STATE_DISPLAY,
  InterviewState,
} from '@/types/enums';

interface FeedInterview extends Interview {
  user: {
    name: string;
    title: string | null;
    company: string | null;
    avatar: string | null;
  };
}

interface FeedInterviewListProps {
  interviews: FeedInterview[];
  onView?: (interview: FeedInterview) => void;
  isLoading?: boolean;
}

export default function FeedInterviewList({
  interviews,
  onView,
  isLoading = false,
}: FeedInterviewListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="w-40 h-5 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="w-32 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-24 h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  <div className="flex space-x-4">
                    <div className="w-20 h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="w-16 h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-6" />
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
          No public interviews yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          When users share their interviews publicly, they'll appear here for the community to learn from.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {interviews.map((interview) => (
        <div
          key={interview.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {interview.company}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {/* User info */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4 mr-1" />
                    <span className="font-medium">{interview.user.name}</span>
                    {interview.user.title && !interview.anonymous && (
                      <>
                        <span className="mx-2">·</span>
                        <span>{interview.user.title}</span>
                      </>
                    )}
                    {interview.user.company && !interview.anonymous && (
                      <>
                        <span className="mx-2">at</span>
                        <span className="font-medium">{interview.user.company}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* View button */}
            {onView && (
              <button
                onClick={() => onView(interview)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                title="View interview"
              >
                <Eye className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* State and tags */}
          <div className="flex items-center gap-3 mb-4">
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

            {/* Video indicator */}
            {interview.video_path && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                <Video className="h-4 w-4 mr-2" />
                Video
              </span>
            )}

            {/* Anonymous badge */}
            {interview.anonymous && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                Anonymous
              </span>
            )}
          </div>

          {/* Interview details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Created {formatDate(interview.created_at)}
            </div>
            
            {interview.programming_language && (
              <div className="flex items-center">
                <Code className="h-4 w-4 mr-2" />
                {interview.programming_language}
              </div>
            )}
            
            {interview.type && (
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                {QUESTION_TYPE_DISPLAY[interview.type]}
              </div>
            )}

            {interview.updated_at !== interview.created_at && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Updated {formatDate(interview.updated_at)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}