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
      <div className="space-y-3 sm:space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="w-32 sm:w-40 h-4 sm:h-5 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="w-24 sm:w-32 h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 dark:bg-gray-600 rounded flex-shrink-0"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-20 sm:w-24 h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  <div className="flex space-x-2 sm:space-x-4">
                    <div className="w-16 sm:w-20 h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="w-12 sm:w-16 h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
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
          When users share their interviews publicly, they'll appear here for
          the community to learn from.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {interviews.map((interview) => (
        <div
          key={interview.id}
          onClick={() => onView?.(interview)}
          className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 group cursor-pointer active:scale-[0.99] hover:border-blue-300 dark:hover:border-blue-600"
        >
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors flex-shrink-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                  {interview.company}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {/* User info */}
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 min-w-0">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    <span className="font-medium truncate">
                      {interview.user.name}
                    </span>
                    {interview.user.company && !interview.anonymous && (
                      <>
                        <span className="mx-1 sm:mx-2 flex-shrink-0">at</span>
                        <span className="font-medium truncate">
                          {interview.user.company}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* View indicator */}
            <div className="p-2 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>

          {/* State and tags */}
          <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
            <span
              className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                interview.state === InterviewState.COMPLETED
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : interview.state === InterviewState.PROCESSING
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {interview.state === InterviewState.COMPLETED && (
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              )}
              {interview.state === InterviewState.PROCESSING && (
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              )}
              {interview.state === InterviewState.PENDING && (
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              )}
              {INTERVIEW_STATE_DISPLAY[interview.state]}
            </span>

            {/* Video indicator */}
            {interview.video_path && (
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Video
              </span>
            )}

            {/* Anonymous badge */}
            {interview.anonymous && (
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                Anonymous
              </span>
            )}
          </div>

          {/* Interview details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">
                Created {formatDate(interview.created_at)}
              </span>
            </div>

            {interview.programming_language && (
              <div className="flex items-center">
                <Code className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">
                  {interview.programming_language}
                </span>
              </div>
            )}

            {interview.type && (
              <div className="flex items-center">
                <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">
                  {QUESTION_TYPE_DISPLAY[interview.type]}
                </span>
              </div>
            )}

            {interview.updated_at !== interview.created_at && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">
                  Updated {formatDate(interview.updated_at)}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}