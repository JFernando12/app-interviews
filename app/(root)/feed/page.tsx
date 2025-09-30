'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Globe, Users } from 'lucide-react';
import FeedInterviewList from '@/components/FeedInterviewList';
import { Interview } from '@/lib/dynamodb';
import PageHeader from '@/components/PageHeader';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2 sm:py-4">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <PageHeader
            title="Community Feed"
            description="Discover public interviews shared by the community"
          />
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex items-start ${
              notification.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
            )}
            <span className="text-sm sm:text-base">{notification.message}</span>
          </div>
        )}

        {/* Info Banner */}
        {!isLoading && interviews.length > 0 && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm min-w-0">
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
