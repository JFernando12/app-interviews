'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import { FormattedAnswer } from '@/components/FormattedAnswer';
import {
  StaticQuestionLoader,
  QuestionUtils,
  TechnicalQuestion,
} from '@/lib/data/questionLoader';
import { BookOpen, ChevronDown } from 'lucide-react';

export default function SystemDesignPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Load system design questions
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const staticQuestions =
          await StaticQuestionLoader.loadTechnicalQuestions('system-design');
        setQuestions(staticQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
        setQuestions([]);
      }
      setLoading(false);
    };

    loadQuestions();
  }, []);

  // Filter questions based on search term
  useEffect(() => {
    setFilteredQuestions(QuestionUtils.searchQuestions(questions, searchTerm));
  }, [questions, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2 sm:py-3">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <PageHeader
          breadcrumbs={[
            { label: 'Practice', href: '/practice' },
            { label: 'System Design' },
          ]}
        />

        {/* Search + count */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-200 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent
                           placeholder-gray-500 dark:placeholder-gray-400"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {filteredQuestions.length} of {questions.length} questions
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-500"></div>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Loading questions...
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No questions found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
                  {questions.length === 0
                    ? 'No questions available yet.'
                    : 'No questions match your search.'}
                </p>
              </div>
            ) : (
              filteredQuestions.map((question) => {
                const q = question as TechnicalQuestion;
                return (
                  <div
                    key={question.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="space-y-2 mb-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white leading-tight flex-1">
                          {question.question}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                            q.difficulty === 'beginner'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : q.difficulty === 'intermediate'
                                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {q.difficulty || 'intermediate'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium text-orange-600 bg-orange-50 dark:bg-gray-700 whitespace-nowrap">
                          System Design
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {question.context}
                      </p>
                    </div>

                    <details className="group">
                      <summary className="cursor-pointer text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                        Show Answer
                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 transform group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <FormattedAnswer
                          answer={question.answer}
                          isDarkMode={isDarkMode}
                        />
                      </div>
                    </details>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
