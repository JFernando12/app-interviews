'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Question } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import { FormattedAnswer } from '@/components/FormattedAnswer';
import {
  StaticQuestionLoader,
  QuestionUtils,
  TechnicalQuestion,
} from '@/lib/data/questionLoader';
import { BookOpen, Filter, ChevronDown } from 'lucide-react';

interface TopicFilter {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

function AIEngineerPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const availableTopics = ['general'];

  const urlTopic = searchParams.get('topic');
  const initialTopic =
    urlTopic && availableTopics.includes(urlTopic) ? urlTopic : 'general';

  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleTopicChange = (topicId: string) => {
    setSelectedTopic(topicId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('topic', topicId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

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

  const scrollbarHideStyle = {
    scrollbarWidth: 'none' as const,
    msOverflowStyle: 'none' as const,
  };

  const topics: TopicFilter[] = [
    {
      id: 'general',
      name: 'General',
      icon: '🤖',
      color: 'text-violet-600',
      bgColor: 'bg-gradient-to-br from-violet-50 via-violet-100 to-purple-100',
      borderColor: 'border-violet-200 hover:border-violet-300',
    },
  ];

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const staticQuestions =
          await StaticQuestionLoader.loadAIEngineerQuestions(selectedTopic);
        setQuestions(staticQuestions);
      } catch (error) {
        console.error('Error loading AI Engineer questions:', error);
        setQuestions([]);
      }
      setLoading(false);
    };

    loadQuestions();
  }, [selectedTopic]);

  useEffect(() => {
    const filtered = QuestionUtils.searchQuestions(questions, searchTerm);
    setFilteredQuestions(filtered);
  }, [questions, searchTerm]);

  const currentTopic = topics.find((t) => t.id === selectedTopic);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2 sm:py-3">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <PageHeader
          breadcrumbs={[
            { label: 'Practice', href: '/practice' },
            { label: 'AI Engineer Questions' },
          ]}
        />

        {/* Topic Filter */}
        <div className="mb-3 sm:mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Topic
              </h3>
              {currentTopic && (
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  {questions.length} questions
                </span>
              )}
            </div>

            <div className="relative">
              <div
                className="flex gap-2 overflow-x-auto pb-2 -mb-2"
                style={scrollbarHideStyle}
              >
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicChange(topic.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200
                      text-sm font-medium whitespace-nowrap flex-shrink-0 min-w-fit
                      ${
                        selectedTopic === topic.id
                          ? `${topic.borderColor.replace('hover:', '')} ${topic.bgColor} ${topic.color}`
                          : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    <span className="text-xl">{topic.icon}</span>
                    <span className="text-xs sm:text-sm">{topic.name}</span>
                  </button>
                ))}
              </div>
              <div className="absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none opacity-50"></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-200 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent
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
            <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-violet-600"></div>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Loading {currentTopic?.name}...
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
                    ? `No questions available for ${currentTopic?.name} yet.`
                    : 'No questions match your current filters.'}
                </p>
              </div>
            ) : (
              filteredQuestions.map((question) => {
                const aiQuestion = question as TechnicalQuestion;
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
                            aiQuestion.difficulty === 'beginner'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : aiQuestion.difficulty === 'intermediate'
                                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {aiQuestion.difficulty || 'intermediate'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium ${currentTopic?.color} bg-gray-50 dark:bg-gray-700 whitespace-nowrap`}
                        >
                          {currentTopic?.name}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {question.context}
                      </p>
                    </div>

                    <details className="group">
                      <summary className="cursor-pointer text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1">
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

export default function AIEngineerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2 sm:py-3">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-violet-600"></div>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Loading...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <AIEngineerPageContent />
    </Suspense>
  );
}
