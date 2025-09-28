'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/lib/dynamodb';
import {
  HelpCircle,
  Code,
  Users,
  Target,
  Zap,
  ArrowRight
} from 'lucide-react';

interface QuestionType {
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
      const response = await fetch('/api/questions?global=true');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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

    return questions.filter((q) => {
      const context = q.context?.toLowerCase() || '';
      const question = q.question?.toLowerCase() || '';

      switch (type) {
        case 'behavioral':
          return (
            context.includes('behavioral') || question.includes('behavioral')
          );
        case 'technical':
          return (
            context.includes('technical') ||
            question.includes('technical') ||
            context.includes('coding') ||
            question.includes('coding')
          );
        case 'system-design':
          return (
            context.includes('system') ||
            context.includes('design') ||
            question.includes('system') ||
            question.includes('design')
          );
        case 'leadership':
          return (
            context.includes('leadership') ||
            context.includes('management') ||
            question.includes('leadership') ||
            question.includes('management')
          );
        default:
          return false;
      }
    }).length;
  };

  // Define question types
  const questionTypes: QuestionType[] = [
    {
      id: 'behavioral',
      name: 'Behavioral Questions',
      description:
        'Assess soft skills, past experiences, and cultural fit through STAR methodology',
      icon: <Users className="w-10 h-10" />,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100',
      borderColor: 'border-blue-200 group-hover:border-blue-300',
      count: getQuestionCount('behavioral'),
    },
    {
      id: 'technical',
      name: 'Technical Questions',
      description:
        'Evaluate coding skills, algorithms, and technical problem-solving abilities',
      icon: <Code className="w-10 h-10" />,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 via-purple-100 to-violet-100',
      borderColor: 'border-purple-200 group-hover:border-purple-300',
      count: getQuestionCount('technical'),
    },
    {
      id: 'system-design',
      name: 'System Design',
      description:
        'Test architecture knowledge, scalability thinking, and system trade-offs',
      icon: <Target className="w-10 h-10" />,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 via-green-100 to-emerald-100',
      borderColor: 'border-green-200 group-hover:border-green-300',
      count: getQuestionCount('system-design'),
    },
    {
      id: 'leadership',
      name: 'Leadership & Management',
      description:
        'Explore management philosophy, team building, and strategic decision-making',
      icon: <Zap className="w-10 h-10" />,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 via-orange-100 to-amber-100',
      borderColor: 'border-orange-200 group-hover:border-orange-300',
      count: getQuestionCount('leadership'),
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
      <div className="min-h-screen bg-gray-50 pt-10 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Loading question types...
          </h3>
          <p className="text-gray-600">
            Please wait while we prepare your question categories
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <HelpCircle className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Questions
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchQuestions} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-10">
      {/* Question Types Grid */}
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {questionTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer
                hover:shadow-lg hover:scale-[1.02] group
                ${type.bgColor} ${type.borderColor}
              `}
            >
              {/* Question Count Badge */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white/90 text-gray-700 shadow-sm">
                  {type.count}
                </span>
              </div>

              {/* Icon */}
              <div className={`${type.color} mb-4`}>{type.icon}</div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800">
                {type.name}
              </h3>
              <p className="text-gray-700 mb-4 text-sm leading-relaxed">
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