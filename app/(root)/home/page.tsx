'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/lib/dynamodb';
import {
  QuestionType as QuestionTypeEnum,
  QuestionTypeUtils,
} from '@/types/enums';
import { HelpCircle, Code, Users, Target, Zap, ArrowRight } from 'lucide-react';

interface QuestionTypeDisplay {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  count: number;
}

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch all global questions to calculate type counts
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/questions?global=true');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Calculate question counts by type
  const getQuestionCount = (type: string): number => {
    if (type === 'all') return questions.length;
    return questions.filter((q) => q.type === type).length;
  };

  // Define question types
  const questionTypes: QuestionTypeDisplay[] = [
    {
      id: QuestionTypeEnum.BEHAVIORAL,
      name:
        QuestionTypeUtils.getDisplayName(QuestionTypeEnum.BEHAVIORAL) +
        ' Questions',
      description: QuestionTypeUtils.getDescription(
        QuestionTypeEnum.BEHAVIORAL
      ),
      icon: <Users className="w-full h-full" />,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100',
      borderColor: 'border-blue-200 group-hover:border-blue-300',
      count: getQuestionCount(QuestionTypeEnum.BEHAVIORAL),
    },
    {
      id: QuestionTypeEnum.TECHNICAL,
      name:
        QuestionTypeUtils.getDisplayName(QuestionTypeEnum.TECHNICAL) +
        ' Questions',
      description: QuestionTypeUtils.getDescription(QuestionTypeEnum.TECHNICAL),
      icon: <Code className="w-full h-full" />,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 via-purple-100 to-violet-100',
      borderColor: 'border-purple-200 group-hover:border-purple-300',
      count: getQuestionCount(QuestionTypeEnum.TECHNICAL),
    },
    {
      id: QuestionTypeEnum.SYSTEM_DESIGN,
      name: QuestionTypeUtils.getDisplayName(QuestionTypeEnum.SYSTEM_DESIGN),
      description: QuestionTypeUtils.getDescription(
        QuestionTypeEnum.SYSTEM_DESIGN
      ),
      icon: <Target className="w-full h-full" />,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 via-green-100 to-emerald-100',
      borderColor: 'border-green-200 group-hover:border-green-300',
      count: getQuestionCount(QuestionTypeEnum.SYSTEM_DESIGN),
    },
    {
      id: QuestionTypeEnum.LEADERSHIP,
      name:
        QuestionTypeUtils.getDisplayName(QuestionTypeEnum.LEADERSHIP) +
        ' & Management',
      description: QuestionTypeUtils.getDescription(
        QuestionTypeEnum.LEADERSHIP
      ),
      icon: <Zap className="w-full h-full" />,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 via-orange-100 to-amber-100',
      borderColor: 'border-orange-200 group-hover:border-orange-300',
      count: getQuestionCount(QuestionTypeEnum.LEADERSHIP),
    },
    {
      id: QuestionTypeEnum.CODING,
      name:
        QuestionTypeUtils.getDisplayName(QuestionTypeEnum.CODING) +
        ' Questions',
      description: QuestionTypeUtils.getDescription(QuestionTypeEnum.CODING),
      icon: <Code className="w-full h-full" />,
      color: 'text-indigo-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 via-indigo-100 to-blue-100',
      borderColor: 'border-indigo-200 group-hover:border-indigo-300',
      count: getQuestionCount(QuestionTypeEnum.CODING),
    },
    {
      id: 'all',
      name: 'All Questions',
      description:
        'Browse your complete question collection across all categories',
      icon: <HelpCircle className="w-full h-full" />,
      color: 'text-gray-600',
      bgColor: 'bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100',
      borderColor: 'border-gray-200 group-hover:border-gray-300',
      count: getQuestionCount('all'),
    },
  ];

  const handleTypeSelect = (typeId: string) => {
    router.push(`/home/${typeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-3 sm:mb-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 animate-pulse">
              <div className="text-center sm:text-left">
                <div className="w-32 sm:w-48 h-6 sm:h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2 mx-auto sm:mx-0"></div>
                <div className="w-48 sm:w-96 h-4 sm:h-5 bg-gray-200 dark:bg-gray-600 rounded mx-auto sm:mx-0"></div>
              </div>
            </div>
          </div>

          {/* Question Types Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
              >
                {/* Question Count Badge */}
                <div className="flex justify-end mb-3 sm:mb-4">
                  <div className="w-6 sm:w-8 h-4 sm:h-6 bg-gray-200 dark:bg-gray-600 rounded-md"></div>
                </div>

                {/* Icon */}
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gray-200 dark:bg-gray-600 rounded mb-2 sm:mb-3 lg:mb-4"></div>

                {/* Content */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="w-28 sm:w-40 h-4 sm:h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="w-full h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="w-3/4 h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="flex items-center justify-between mt-3 sm:mt-4">
                  <div className="w-20 sm:w-24 h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-6 sm:pt-8 lg:pt-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-600 dark:text-red-400 mb-3 sm:mb-4">
                  <HelpCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Error Loading Questions
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                  {error}
                </p>
                <button
                  onClick={fetchQuestions}
                  className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 text-sm sm:text-base"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                Question Categories
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
                Choose a category to practice interview questions or browse your
                complete collection.
              </p>
            </div>
          </div>
        </div>
        {/* Question Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {questionTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className={`
                relative p-3 sm:p-4 lg:p-6 rounded-xl border transition-all duration-200 cursor-pointer
                hover:shadow-lg active:scale-[0.98] sm:hover:scale-[1.02] group
                bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
                hover:border-gray-300 dark:hover:border-gray-600 shadow-sm
              `}
            >
              {/* Question Count Badge */}
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4">
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-xs font-medium ${type.color} bg-gray-50 dark:bg-gray-700`}
                >
                  {type.count}
                </span>
              </div>

              {/* Icon */}
              <div className={`${type.color} mb-2 sm:mb-3 lg:mb-4`}>
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10">
                  {type.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 group-hover:text-gray-800 dark:group-hover:text-gray-200 leading-tight">
                {type.name}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
                {type.description}
              </p>

              {/* Call to Action */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-medium ${type.color}`}
                >
                  {type.count > 0 ? 'Browse Questions' : 'No Questions Yet'}
                </span>
                <div
                  className={`${type.color} transform transition-transform group-hover:translate-x-1`}
                >
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}