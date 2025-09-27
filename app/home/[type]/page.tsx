'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Question } from '@/lib/dynamodb';
import QuestionForm from '@/components/QuestionForm';
import QuestionList from '@/components/QuestionList';
import Modal from '@/components/Modal';
import { Plus, ArrowLeft, Users, Code, Target, Zap, HelpCircle, Filter } from 'lucide-react';

interface QuestionTypeInfo {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function QuestionTypePage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;
  
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Type configurations
  const typeInfo: Record<string, QuestionTypeInfo> = {
    behavioral: {
      name: 'Behavioral Questions',
      description: 'Questions that assess soft skills, past experiences, and cultural fit',
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-600',
    },
    technical: {
      name: 'Technical Questions',
      description: 'Questions that evaluate coding skills and technical knowledge',
      icon: <Code className="w-6 h-6" />,
      color: 'text-purple-600',
    },
    'system-design': {
      name: 'System Design Questions',
      description: 'Questions that test architecture and scalability understanding',
      icon: <Target className="w-6 h-6" />,
      color: 'text-green-600',
    },
    leadership: {
      name: 'Leadership & Management Questions',
      description: 'Questions that explore management style and leadership experience',
      icon: <Zap className="w-6 h-6" />,
      color: 'text-orange-600',
    },
    all: {
      name: 'All Questions',
      description: 'Complete collection of all interview questions',
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'text-gray-600',
    },
  };

  const currentTypeInfo = typeInfo[type] || typeInfo.all;

  // Fetch all questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/questions');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setAllQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Filter questions based on type
  const filterQuestionsByType = (questions: Question[], type: string): Question[] => {
    if (type === 'all') return questions;

    return questions.filter(q => {
      const context = q.context?.toLowerCase() || '';
      const question = q.question?.toLowerCase() || '';
      
      switch (type) {
        case 'behavioral':
          return context.includes('behavioral') || question.includes('behavioral');
        case 'technical':
          return context.includes('technical') || question.includes('technical') || 
                 context.includes('coding') || question.includes('coding');
        case 'system-design':
          return context.includes('system') || context.includes('design') || 
                 question.includes('system') || question.includes('design');
        case 'leadership':
          return context.includes('leadership') || context.includes('management') || 
                 question.includes('leadership') || question.includes('management');
        default:
          return false;
      }
    });
  };

  // Create or update a question
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

  // Export questions to JSON
  const exportQuestions = () => {
    const dataStr = JSON.stringify(filteredQuestions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${type}-questions-${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchQuestions();

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            openNewQuestionModal();
            break;
          case 'e':
            e.preventDefault();
            if (filteredQuestions.length > 0) {
              exportQuestions();
            }
            break;
          case 'b':
            e.preventDefault();
            router.push('/questions');
            break;
        }
      }

      if (e.key === 'Escape' && isModalOpen) {
        cancelEdit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, filteredQuestions.length, router]);

  // Update filtered questions when allQuestions or type changes
  useEffect(() => {
    setFilteredQuestions(filterQuestionsByType(allQuestions, type));
  }, [allQuestions, type]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Loading {currentTypeInfo.name.toLowerCase()}...
          </h3>
          <p className="text-gray-600">Please wait while we fetch your questions</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <HelpCircle className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Questions
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchQuestions}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className="container py-6">
        <div className="max-w-7xl mx-auto">
          {filteredQuestions.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <QuestionList
                  questions={filteredQuestions}
                  onEdit={editQuestion}
                  onDelete={deleteQuestion}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <div className={currentTypeInfo.color}>
                  <div className="w-16 h-16 mx-auto mb-3 opacity-50">
                    {currentTypeInfo.icon}
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                No {currentTypeInfo.name} Found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {type === 'all'
                  ? "You haven't created any questions yet. Start building your question bank now!"
                  : `You don't have any ${currentTypeInfo.name.toLowerCase()} yet. Create your first question in this category!`}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={openNewQuestionModal}
                  className="btn btn-primary btn-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Question
                </button>
                {type !== 'all' && (
                  <button
                    onClick={() => router.push('/questions/all')}
                    className="btn btn-secondary btn-sm"
                  >
                    View All Questions
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
  );
}
