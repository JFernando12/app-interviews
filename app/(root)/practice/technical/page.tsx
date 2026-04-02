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
import {
  DiPython,
  DiReact,
  DiNodejs,
} from 'react-icons/di';
import { SiTypescript } from 'react-icons/si';

// Language/Framework configuration
interface TechnologyFilter {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// Helper to render technology icon
const TechIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
  const iconProps = { className: className || 'text-xl' };
  
  switch (iconName) {
    case 'DiPython':
      return <DiPython {...iconProps} />;
    case 'DiReact':
      return <DiReact {...iconProps} />;
    case 'DiNodejs':
      return <DiNodejs {...iconProps} />;
    case 'SiTypescript':
      return <SiTypescript {...iconProps} />;
    default:
      return <span>{iconName}</span>;
  }
};

// Component that uses useSearchParams - must be wrapped in Suspense
function TechnicalPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Available technologies with question files
  const availableLanguages = [
    'python',
    'react',
    'nodejs',
    'general',
    'ai-engineer',
  ];

  // Get initial technology from URL or default to 'general'
  // Validate that the language has question files available
  const urlLanguage = searchParams.get('programming_language');
  const initialTechnology =
    urlLanguage && availableLanguages.includes(urlLanguage)
      ? urlLanguage
      : 'general';

  const [selectedTechnology, setSelectedTechnology] =
    useState<string>(initialTechnology);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to update technology and URL
  const handleTechnologyChange = (techId: string) => {
    setSelectedTechnology(techId);
    // Update URL with the new programming_language parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('programming_language', techId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // Watch for changes in dark mode
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Add custom scrollbar hiding styles
  const scrollbarHideStyle = {
    scrollbarWidth: 'none' as const,
    msOverflowStyle: 'none' as const,
    WebkitScrollbar: {
      display: 'none',
    },
  };

  // Technology filters - only show technologies with available question files
  // Available question files: nodejs.json, python.json, react.json, general.json
  const technologies: TechnologyFilter[] = [
    {
      id: 'general',
      name: 'General',
      icon: '🎯',
      color: 'text-gray-300',
      bgColor: 'bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100',
      borderColor: 'border-gray-200 hover:border-gray-300',
    },
    {
      id: 'ai-engineer',
      name: 'AI Engineer',
      icon: '🤖',
      color: 'text-violet-400',
      bgColor: 'bg-gradient-to-br from-violet-50 via-violet-100 to-purple-100',
      borderColor: 'border-violet-200 hover:border-violet-300',
    },
    {
      id: 'python',
      name: 'Python',
      icon: 'DiPython',
      color: 'text-blue-300',
      bgColor: 'bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100',
      borderColor: 'border-blue-200 hover:border-blue-300',
    },
    {
      id: 'react',
      name: 'React',
      icon: 'DiReact',
      color: 'text-cyan-600',
      bgColor: 'bg-gradient-to-br from-cyan-50 via-cyan-100 to-blue-100',
      borderColor: 'border-cyan-200 hover:border-cyan-300',
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      icon: 'DiNodejs',
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 via-green-100 to-emerald-100',
      borderColor: 'border-green-200 hover:border-green-300',
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      icon: 'SiTypescript',
      color: 'text-blue-400',
      bgColor: 'bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100',
      borderColor: 'border-blue-200 hover:border-blue-300',
    },
  ];

  // Load data based on selected technology
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        // Load static questions from JSON files
        const staticQuestions =
          await StaticQuestionLoader.loadTechnicalQuestions(selectedTechnology);
        setQuestions(staticQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
        setQuestions([]);
      }

      setLoading(false);
    };

    loadQuestions();
  }, [selectedTechnology]);

  // Filter questions based on search term
  useEffect(() => {
    let filtered = questions;

    // Apply search filter
    filtered = QuestionUtils.searchQuestions(filtered, searchTerm);

    setFilteredQuestions(filtered);
  }, [questions, searchTerm]);

  const currentTech = technologies.find(
    (tech) => tech.id === selectedTechnology,
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2 sm:py-3">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <PageHeader
          breadcrumbs={[
            { label: 'Practice', href: '/practice' },
            { label: 'Technical Questions' },
          ]}
        />
        {/* Technology Filter */}
        <div className="mb-3 sm:mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Technology
              </h3>
              {currentTech && (
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  {questions.length} questions
                </span>
              )}
            </div>

            {/* Horizontal Scrollable Technology Selector */}
            <div className="relative">
              <div
                className="flex gap-2 overflow-x-auto pb-2 -mb-2"
                style={scrollbarHideStyle}
              >
                {technologies.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => handleTechnologyChange(tech.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 
                      text-sm font-medium whitespace-nowrap flex-shrink-0 min-w-fit
                      ${
                        selectedTechnology === tech.id
                          ? `${tech.borderColor.replace('hover:', '')} ${
                              tech.bgColor
                            } ${tech.color}`
                          : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    <TechIcon iconName={tech.icon} className="text-xl" />
                    <span className="text-xs sm:text-sm">{tech.name}</span>
                  </button>
                ))}
              </div>

              {/* Scroll indicators */}
              <div className="absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none opacity-50"></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-200 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
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

          {/* Results Count */}
          <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {filteredQuestions.length} of {questions.length} questions
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Loading {currentTech?.name}...
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
                    ? `No questions available for ${currentTech?.name} yet.`
                    : 'No questions match your current filters.'}
                </p>
              </div>
            ) : (
              filteredQuestions.map((question, index) => {
                const techQuestion = question as TechnicalQuestion;
                return (
                  <div
                    key={question.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="space-y-2 mb-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white leading-tight flex-1">
                          <span className="text-gray-400 dark:text-gray-500 font-normal mr-1 sm:text-sm">
                            {index + 1}.
                          </span>
                          {question.question}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Difficulty Badge */}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                            techQuestion.difficulty === 'beginner'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : techQuestion.difficulty === 'intermediate'
                                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {techQuestion.difficulty || 'intermediate'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium ${currentTech?.color} bg-gray-50 dark:bg-gray-700 whitespace-nowrap`}
                        >
                          {currentTech?.name}
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

// Main export with Suspense boundary
export default function TechnicalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2 sm:py-3">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Loading...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <TechnicalPageContent />
    </Suspense>
  );
}