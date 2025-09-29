'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Question } from '@/lib/dynamodb';
import { QuestionType, QuestionTypeUtils, ProgrammingLanguage, ProgrammingLanguageUtils } from '@/types/enums';
import QuestionForm from '@/components/QuestionForm';
import QuestionList from '@/components/QuestionList';
import Modal from '@/components/Modal';
import ExportDropdown from '@/components/ExportDropdown';
import {
  Plus,
  HelpCircle,
  Users,
  Code,
  Target,
  Zap,
  Search,
  LogIn,
  BookOpen,
  Eye,
} from 'lucide-react';

function QuestionsPageContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const interview_id = searchParams.get('interview_id');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [studyMode, setStudyMode] = useState(false);
  const [interviewData, setInterviewData] = useState<{
    company: string;
  } | null>(null);

  // Question type filters
  const questionTypes = [
    { id: 'all', name: 'All Questions', icon: HelpCircle, count: 0 },
    {
      id: QuestionType.HUMAN_RESOURCES,
      name: QuestionTypeUtils.getDisplayName(QuestionType.HUMAN_RESOURCES),
      icon: Users,
      count: 0,
    },
    {
      id: QuestionType.TECHNICAL,
      name: QuestionTypeUtils.getDisplayName(QuestionType.TECHNICAL),
      icon: Code,
      count: 0,
    },
    {
      id: QuestionType.BEHAVIORAL,
      name: QuestionTypeUtils.getDisplayName(QuestionType.BEHAVIORAL),
      icon: Users,
      count: 0,
    },
    {
      id: QuestionType.SYSTEM_DESIGN,
      name: QuestionTypeUtils.getDisplayName(QuestionType.SYSTEM_DESIGN),
      icon: Target,
      count: 0,
    },
    {
      id: QuestionType.LEADERSHIP,
      name: QuestionTypeUtils.getDisplayName(QuestionType.LEADERSHIP),
      icon: Zap,
      count: 0,
    },
    {
      id: QuestionType.CODING,
      name: QuestionTypeUtils.getDisplayName(QuestionType.CODING),
      icon: Code,
      count: 0,
    },
    {
      id: QuestionType.OTHER,
      name: QuestionTypeUtils.getDisplayName(QuestionType.OTHER),
      icon: HelpCircle,
      count: 0,
    },
  ];

  // Programming language filters
  const programmingLanguages = [
    { id: 'all', name: 'All Languages', count: 0 },
    ...ProgrammingLanguageUtils.getAllLanguages().map(lang => ({
      id: lang,
      name: ProgrammingLanguageUtils.getDisplayName(lang),
      count: 0,
    })),
  ];

  // Update counts
  const updateTypeCounts = (questionList: Question[]) => {
    return questionTypes.map((type) => {
      if (type.id === 'all') {
        return { ...type, count: questionList.length };
      }

      const count = questionList.filter((q) => {
        return type.id === q.type;
      }).length;

      return { ...type, count };
    });
  };

  // Update language counts
  const updateLanguageCounts = (questionList: Question[]) => {
    return programmingLanguages.map((language) => {
      if (language.id === 'all') {
        return { ...language, count: questionList.length };
      }

      const count = questionList.filter((q) => {
        return language.id === q.programming_language;
      }).length;

      return { ...language, count };
    });
  };

  // Fetch interview data when interview_id is provided
  const fetchInterviewData = async (id: string) => {
    try {
      const response = await fetch(`/api/interviews/${id}`);
      if (response.ok) {
        const interview = await response.json();
        setInterviewData({ company: interview.company });
      }
    } catch (error) {
      console.error('Error fetching interview data:', error);
    }
  };

  // Fetch user-specific questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);

      // Build the API URL with optional interview_id parameter
      const url = new URL('/api/questions', window.location.origin);
      if (interview_id) {
        url.searchParams.set('interview_id', interview_id);
      }

      const response = await fetch(url.toString());
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
    } finally {
      setLoading(false);
    }
  };

  // Filter questions based on type and search
  const filterQuestions = () => {
    let filtered = questions;
    console.log('Filtered: ', filtered);
    console.log('Filtering questions:', { filterType, filterLanguage, searchQuery });
    console.log('filterType:: ', filterType);
    console.log('filterLanguage:: ', filterLanguage);

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((q) => filterType === q.type);
      console.log('Filtered by type:', filtered);
    }

    // Filter by programming language
    if (filterLanguage !== 'all') {
      filtered = filtered.filter((q) => filterLanguage === q.programming_language);
      console.log('Filtered by language:', filtered);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.question.toLowerCase().includes(query) ||
          q.answer.toLowerCase().includes(query) ||
          q.context?.toLowerCase().includes(query) ||
          q.type?.toLowerCase().includes(query) ||
          q.programming_language?.toLowerCase().includes(query)
      );
    }

    setFilteredQuestions(filtered);
  };

  // Save a question (create or update)
  const saveQuestion = async (
    questionData: Omit<Question, 'id' | 'created_at' | 'updated_at'>
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
      const message = err instanceof Error ? err.message : 'An error occurred';
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
    } catch (err) {}
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
      if (interview_id) {
        fetchInterviewData(interview_id);
      }
    }
  }, [status, router, interview_id]); // Added interview_id as dependency

  useEffect(() => {
    filterQuestions();
  }, [questions, filterType, filterLanguage, searchQuery]);

  // Clear filters when entering study mode
  useEffect(() => {
    if (studyMode) {
      setFilterType('all');
      setFilterLanguage('all');
      setSearchQuery('');
    }
  }, [studyMode]);

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
  const languagesWithCounts = updateLanguageCounts(questions);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center">
                  {interview_id && interviewData ? (
                    <>
                      Interview Questions - {interviewData.company}
                      <button
                        onClick={() => router.push('/questions')}
                        className="ml-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
                      >
                        View All Questions
                      </button>
                    </>
                  ) : (
                    'Questions'
                  )}
                  {studyMode && (
                    <span className="ml-3 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                      Study Mode
                    </span>
                  )}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {studyMode
                    ? 'Study mode shows complete context, questions, and answers for better learning.'
                    : interview_id && interviewData
                    ? `Questions for ${interviewData.company} interview session.`
                    : 'Manage your personal interview questions collection.'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <ExportDropdown
                  questions={filteredQuestions}
                  filterType={filterType}
                  searchQuery={searchQuery}
                  disabled={loading}
                />
                <button
                  onClick={() => setStudyMode(!studyMode)}
                  className={`font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                    studyMode
                      ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500'
                  }`}
                >
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {studyMode ? 'Exit Study Mode' : 'Study Mode'}
                  </div>
                </button>
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
        </div>

        <div className={`grid grid-cols-1 ${studyMode ? 'lg:grid-cols-1' : 'lg:grid-cols-4'} gap-6`}>
          {/* Sidebar - Filters */}
          {!studyMode && (
            <div className="lg:col-span-1 space-y-6">
              {/* Search Container */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div>
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
              </div>

              {/* Type Filters Container */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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

              {/* Programming Language Filters Container */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    Filter by Language
                  </h3>
                  <div className="space-y-2">
                    {languagesWithCounts.map((language) => (
                      <button
                        key={language.id}
                        onClick={() => setFilterLanguage(language.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                          filterLanguage === language.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Code className="w-4 h-4" />
                          <span className="text-sm font-medium">{language.name}</span>
                        </div>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                          {language.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={studyMode ? 'col-span-1' : 'lg:col-span-3'}>
            {filteredQuestions.length > 0 || loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  {!loading && (
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {filteredQuestions.length} Question
                        {filteredQuestions.length !== 1 ? 's' : ''}
                        {(filterType !== 'all' || filterLanguage !== 'all') && (
                          <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                            {filterType !== 'all' && (
                              <>
                                in{' '}
                                {
                                  typesWithCounts.find((t) => t.id === filterType)
                                    ?.name
                                }
                              </>
                            )}
                            {filterType !== 'all' && filterLanguage !== 'all' && ' • '}
                            {filterLanguage !== 'all' && (
                              <>
                                for{' '}
                                {
                                  languagesWithCounts.find((l) => l.id === filterLanguage)
                                    ?.name
                                }
                              </>
                            )}
                          </span>
                        )}
                      </h2>
                      <div className="flex items-center space-x-3">
                        {(filterType !== 'all' || filterLanguage !== 'all') && (
                          <button
                            onClick={() => {
                              setFilterType('all');
                              setFilterLanguage('all');
                            }}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded px-2 py-1"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <QuestionList
                    questions={filteredQuestions}
                    onEdit={editQuestion}
                    onDelete={deleteQuestion}
                    isLoading={loading}
                    studyMode={studyMode}
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
            global={false}
            initialData={editingQuestion || undefined}
            onSubmit={saveQuestion}
            onCancel={cancelEdit}
          />
        </Modal>
      </div>
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <QuestionsPageContent />
    </Suspense>
  );
}
