'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Question } from '@/lib/dynamodb';
import QuestionForm from '@/components/QuestionForm';
import QuestionList from '@/components/QuestionList';
import Modal from '@/components/Modal';
import {
  Plus,
  HelpCircle,
  Filter,
  Users,
  Code,
  Target,
  Zap,
  Search,
  LogIn,
} from 'lucide-react';

export default function QuestionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Question type filters
  const questionTypes = [
    { id: 'all', name: 'All Questions', icon: HelpCircle, count: 0 },
    { id: 'behavioral', name: 'Behavioral', icon: Users, count: 0 },
    { id: 'technical', name: 'Technical', icon: Code, count: 0 },
    { id: 'system-design', name: 'System Design', icon: Target, count: 0 },
    { id: 'leadership', name: 'Leadership', icon: Zap, count: 0 },
  ];

  // Update counts
  const updateTypeCounts = (questionList: Question[]) => {
    return questionTypes.map((type) => {
      if (type.id === 'all') {
        return { ...type, count: questionList.length };
      }

      const count = questionList.filter((q) => {
        const context = q.context?.toLowerCase() || '';
        const question = q.question?.toLowerCase() || '';

        switch (type.id) {
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

      return { ...type, count };
    });
  };

  // Fetch user-specific questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/questions');
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to view your questions');
        }
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

  // Filter questions based on type and search
  const filterQuestions = () => {
    let filtered = questions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((q) => {
        const context = q.context?.toLowerCase() || '';
        const question = q.question?.toLowerCase() || '';

        switch (filterType) {
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
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.question.toLowerCase().includes(query) ||
          q.answer.toLowerCase().includes(query) ||
          q.context.toLowerCase().includes(query) ||
          q.type.toLowerCase().includes(query) ||
          q.programming_language.toLowerCase().includes(query)
      );
    }

    setFilteredQuestions(filtered);
  };

  // Save a question (create or update)
  const saveQuestion = async (
    questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const url = editingQuestion
        ? `/api/questions/${editingQuestion.id}`
        : '/api/questions';

      const method = editingQuestion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to manage questions');
        }
        throw new Error(
          `Failed to ${editingQuestion ? 'update' : 'create'} question`
        );
      }

      await fetchQuestions();
      setEditingQuestion(null);
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Delete a question
  const deleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to manage questions');
        }
        throw new Error('Failed to delete question');
      }

      await fetchQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Edit a question
  const editQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingQuestion(null);
    setIsModalOpen(false);
  };

  // Open modal for new question
  const openNewQuestionModal = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchQuestions();
    }
  }, [status, router]);

  useEffect(() => {
    filterQuestions();
  }, [questions, filterType, searchQuery]);

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <LogIn className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 mb-4">
            Please sign in to manage your questions.
          </p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const typesWithCounts = updateTypeCounts(questions);

  return (
    <div className="min-h-screen bg-gray-50 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Your Questions
                </h1>
                <p className="text-gray-600">
                  Manage your personal interview questions collection.
                </p>
              </div>
              <button
                onClick={openNewQuestionModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Question
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchQuestions}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Questions
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Type Filters */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  Filter by Type
                </h3>
                <div className="space-y-2">
                  {typesWithCounts.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setFilterType(type.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        filterType === type.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <type.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{type.name}</span>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {type.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your questions...</p>
              </div>
            ) : filteredQuestions.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">
                      {filteredQuestions.length} Question
                      {filteredQuestions.length !== 1 ? 's' : ''}
                      {filterType !== 'all' && (
                        <span className="text-sm font-normal text-gray-600 ml-2">
                          in{' '}
                          {
                            typesWithCounts.find((t) => t.id === filterType)
                              ?.name
                          }
                        </span>
                      )}
                    </h2>
                    {filterType !== 'all' && (
                      <button
                        onClick={() => setFilterType('all')}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Clear filter
                      </button>
                    )}
                  </div>
                  <QuestionList
                    questions={filteredQuestions}
                    onEdit={editQuestion}
                    onDelete={deleteQuestion}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <HelpCircle className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {searchQuery.trim() || filterType !== 'all'
                    ? 'No matching questions found'
                    : 'No questions yet'}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  {searchQuery.trim() || filterType !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : "You haven't created any questions yet. Start building your question bank now!"}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={openNewQuestionModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Question
                  </button>
                  {(searchQuery.trim() || filterType !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterType('all');
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal for Question Form */}
        <Modal
          isOpen={isModalOpen}
          onClose={cancelEdit}
          title={editingQuestion ? 'Edit Question' : 'Create New Question'}
          size="lg"
        >
          <QuestionForm
            initialData={editingQuestion || undefined}
            onSubmit={saveQuestion}
            onCancel={cancelEdit}
          />
        </Modal>
      </div>
    </div>
  );
}
