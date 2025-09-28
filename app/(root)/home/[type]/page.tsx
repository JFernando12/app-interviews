'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Question } from '@/lib/dynamodb';
import {
  HelpCircle,
  Code,
  Users,
  Target,
  Zap,
  ArrowLeft,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Tag,
  ChevronDown,
  X,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface QuestionTypeInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function TypePage() {
  const params = useParams();
  const router = useRouter();
  const type = params?.type as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'question'>(
    'newest'
  );
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Define question type configurations
  const questionTypeConfig: Record<string, QuestionTypeInfo> = {
    behavioral: {
      id: 'behavioral',
      name: 'Behavioral Questions',
      description:
        'Assess soft skills, past experiences, and cultural fit through STAR methodology',
      icon: <Users className="w-8 h-8" />,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    },
    technical: {
      id: 'technical',
      name: 'Technical Questions',
      description:
        'Evaluate coding skills, algorithms, and technical problem-solving abilities',
      icon: <Code className="w-8 h-8" />,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-r from-purple-500 to-violet-600',
    },
    'system-design': {
      id: 'system-design',
      name: 'System Design',
      description:
        'Test architecture knowledge, scalability thinking, and system trade-offs',
      icon: <Target className="w-8 h-8" />,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
    },
    leadership: {
      id: 'leadership',
      name: 'Leadership & Management',
      description:
        'Explore management philosophy, team building, and strategic decision-making',
      icon: <Zap className="w-8 h-8" />,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-r from-orange-500 to-amber-600',
    },
    all: {
      id: 'all',
      name: 'All Questions',
      description:
        'Browse your complete question collection across all categories',
      icon: <HelpCircle className="w-8 h-8" />,
      color: 'text-gray-600',
      bgColor: 'bg-gradient-to-r from-gray-500 to-slate-600',
    },
  };

  const currentType = questionTypeConfig[type] || questionTypeConfig.all;

  // Fetch questions
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

  // Filter questions based on type
  const filterQuestionsByType = (questionList: Question[]): Question[] => {
    if (type === 'all') return questionList;

    return questionList.filter((q) => {
      const context = q.context?.toLowerCase() || '';
      const question = q.question?.toLowerCase() || '';

      switch (type) {
        case 'behavioral':
          return (
            context.includes('behavioral') ||
            question.includes('behavioral') ||
            context.includes('behavior')
          );
        case 'technical':
          return (
            context.includes('technical') ||
            question.includes('technical') ||
            context.includes('coding') ||
            question.includes('coding') ||
            context.includes('algorithm') ||
            question.includes('algorithm')
          );
        case 'system-design':
          return (
            context.includes('system') ||
            context.includes('design') ||
            question.includes('system') ||
            question.includes('design') ||
            context.includes('architecture') ||
            question.includes('architecture')
          );
        case 'leadership':
          return (
            context.includes('leadership') ||
            context.includes('management') ||
            question.includes('leadership') ||
            question.includes('management') ||
            context.includes('team') ||
            question.includes('team')
          );
        default:
          return false;
      }
    });
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = filterQuestionsByType(questions);

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (q) =>
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.context.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt || '').getTime() -
            new Date(a.createdAt || '').getTime()
          );
        case 'oldest':
          return (
            new Date(a.createdAt || '').getTime() -
            new Date(b.createdAt || '').getTime()
          );
        case 'question':
          return a.question.localeCompare(b.question);
        default:
          return 0;
      }
    });

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, sortBy, type]);

  const handleEdit = (question: Question) => {
    // Navigate to edit page or open modal
    router.push(`/questions?edit=${question.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      // Remove from local state
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {}
  };

  const toggleCardExpansion = (questionId: string) => {
    setExpandedCard(expandedCard === questionId ? null : questionId);
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
                  Loading {currentType.name.toLowerCase()}...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we fetch your questions
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          {/* Back Navigation */}
          <button
            onClick={() => router.push('/home')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Question Types
          </button>

          {/* Type Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className={`${currentType.color} mr-4`}>
                  {currentType.icon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentType.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
                    {currentType.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  Total Questions
                </div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {filteredQuestions.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search questions, answers, or context..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'newest' | 'oldest' | 'question')
                }
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="question">Alphabetical</option>
              </select>
              <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-16">
            <div className="text-center">
              <div className={`${currentType.color} mb-4`}>
                {currentType.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm
                  ? 'No matching questions found'
                  : `No ${currentType.name.toLowerCase()} yet`}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {searchTerm
                  ? 'Try adjusting your search terms or clear the search to see all questions.'
                  : `Start building your ${currentType.name.toLowerCase()} collection by adding your first question.`}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push('/questions')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Add Your First Question
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-relaxed">
                        {question.question}
                      </h3>
                      {question.context && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <Tag className="w-4 h-4 mr-1" />
                          {question.context}
                        </div>
                      )}
                      {question.createdAt && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(question.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(question)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit question"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Answer Preview/Full */}
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div
                      className={`prose prose-sm max-w-none ${
                        expandedCard === question.id ? '' : 'line-clamp-3'
                      }`}
                    >
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {question.answer}
                      </p>
                    </div>

                    {question.answer.length > 200 && (
                      <button
                        onClick={() => toggleCardExpansion(question.id)}
                        className="mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center"
                      >
                        {expandedCard === question.id ? (
                          <>
                            Show Less
                            <ChevronDown className="w-4 h-4 ml-1 rotate-180" />
                          </>
                        ) : (
                          <>
                            Show More
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
