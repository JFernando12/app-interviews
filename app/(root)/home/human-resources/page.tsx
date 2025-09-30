'use client';

import PageHeader from '@/components/PageHeader';

export default function HumanResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2 sm:py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <PageHeader
          title="HR Prep"
          description="Practice with human resources and general interview questions."
        />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 lg:p-12 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
            Coming Soon
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Human resources interview preparation features are currently in
            development. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
}
