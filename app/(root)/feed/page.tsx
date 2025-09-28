'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Globe, Users } from 'lucide-react';
import FeedInterviewList from '@/components/FeedInterviewList';
import { Interview } from '@/lib/dynamodb';

interface FeedInterview extends Interview {
  user: {
    name: string;
    title: string | null;
    company: string | null;
    avatar: string | null;
  };
}

export default function FeedPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<FeedInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Fetch public interviews
  const fetchPublicInterviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/feed');
      if (!response.ok) {
        throw new Error('Failed to fetch public interviews');
      }
      const data = await response.json();
      setInterviews(data);
    } catch (error) {
      console.error('Error fetching public interviews:', error);
      showNotification('error', 'Failed to load public interviews');
    } finally {
      setIsLoading(false);
    }
  };

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle view interview
  const handleView = (interview: FeedInterview) => {
    router.push(`/feed/${interview.id}`);
  };

  // Load public interviews on component mount
  useEffect(() => {
    fetchPublicInterviews();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Community Feed
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Discover public interviews shared by the community
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {interviews.length}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Public Interviews
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {interviews.filter((i) => !i.anonymous).length}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Named Contributors
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
              notification.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-3" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3" />
            )}
            {notification.message}
          </div>
        )}

        {/* Info Banner */}
        {!isLoading && interviews.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                  Community Contributions
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  These interviews have been shared publicly by community
                  members to help others learn and prepare.
                  {interviews.filter((i) => i.anonymous).length > 0 && (
                    <>
                      {' '}
                      Some contributors have chosen to remain anonymous while
                      still sharing their valuable experiences.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Interview Feed */}
        <FeedInterviewList
          interviews={interviews}
          onView={handleView}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
