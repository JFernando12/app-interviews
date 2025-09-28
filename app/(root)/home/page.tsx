'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/lib/dynamodb';
import {
  QuestionType as QuestionTypeEnum,
  QuestionTypeUtils,
} from '@/types/enums';
import {
  HelpCircle,
  Code,
  Users,
  Target,
  Zap,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

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

    if (QuestionTypeUtils.isValidType(type)) {
      return questions.filter((q) =>
        QuestionTypeUtils.matchesType(
          q.question,
          q.context,
          type as QuestionTypeEnum
        )
      ).length;
    }

    return 0;
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
      icon: <Users className="w-10 h-10" />,
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
      icon: <Code className="w-10 h-10" />,
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
      icon: <Target className="w-10 h-10" />,
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
      icon: <Zap className="w-10 h-10" />,
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
      icon: <Code className="w-10 h-10" />,
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
      icon: <HelpCircle className="w-10 h-10" />,
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Loading question categories...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we prepare your question categories
                </p>
              </div>
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
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-600 dark:text-red-400 mb-4">
                  <HelpCircle className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Error Loading Questions
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                <button
                  onClick={fetchQuestions}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Question Categories
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a category to practice interview questions or browse
                  your complete collection.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Question Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questionTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className={`
                relative p-6 rounded-xl border transition-all duration-200 cursor-pointer
                hover:shadow-lg hover:scale-[1.02] group
                bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
                hover:border-gray-300 dark:hover:border-gray-600 shadow-sm
              `}
            >
              {/* Question Count Badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${type.color} bg-gray-50 dark:bg-gray-700`}
                >
                  {type.count}
                </span>
              </div>

              {/* Icon */}
              <div className={`${type.color} mb-4`}>{type.icon}</div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gray-800 dark:group-hover:text-gray-200">
                {type.name}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                {type.description}
              </p>

              {/* Call to Action */}
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${type.color}`}>
                  {type.count > 0 ? 'Browse Questions' : 'No Questions Yet'}
                </span>
                <div
                  className={`${type.color} transform transition-transform group-hover:translate-x-1`}
                >
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}