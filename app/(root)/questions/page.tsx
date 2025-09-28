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
  Users,
  Code,
  Target,
  Zap,
  Search,
  LogIn,
  AlertCircle,
  CheckCircle,
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
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
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
      const message =
        err instanceof Error ? err.message : 'Failed to load questions';
      setError(message);
      showNotification('error', message);
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
      showNotification(
        'success',
        `Question ${editingQuestion ? 'updated' : 'created'} successfully`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      showNotification('error', message);
    }
  };

  // Delete a question
  const deleteQuestion = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this question? This action cannot be undone.'
      )
    ) {
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
      showNotification('success', 'Question deleted successfully');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete question';
      setError(message);
      showNotification('error', message);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <LogIn className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please sign in to manage your questions.
          </p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const typesWithCounts = updateTypeCounts(questions);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Questions
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your personal interview questions collection.
                </p>
              </div>
              <button
                onClick={openNewQuestionModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  New Question
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
              notification.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-3" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3" />
            )}
            {notification.message}
          </div>
        )}

        {/* Error Display */}
        {error && !notification && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-3 text-red-800 dark:text-red-200" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
            <button
              onClick={fetchQuestions}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              Try again
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Questions
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Type Filters */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Filter by Type
                </h3>
                <div className="space-y-2">
                  {typesWithCounts.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setFilterType(type.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                        filterType === type.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <type.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{type.name}</span>
                      </div>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Loading your questions...
                </p>
              </div>
            ) : filteredQuestions.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {filteredQuestions.length} Question
                      {filteredQuestions.length !== 1 ? 's' : ''}
                      {filterType !== 'all' && (
                        <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
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
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded px-2 py-1"
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <HelpCircle className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {searchQuery.trim() || filterType !== 'all'
                    ? 'No matching questions found'
                    : 'No questions yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                  {searchQuery.trim() || filterType !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : "You haven't created any questions yet. Start building your question bank now!"}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={openNewQuestionModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    <div className="flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Question
                    </div>
                  </button>
                  {(searchQuery.trim() || filterType !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterType('all');
                      }}
                      className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
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
