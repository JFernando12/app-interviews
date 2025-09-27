'use client';

import { useState } from 'react';
import { Question } from '@/lib/dynamodb';
import {
  HelpCircle,
  Search,
  X,
  ChevronDown,
  Edit3,
  Trash2,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Tag,
} from 'lucide-react';

interface QuestionListProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

export default function QuestionList({
  questions,
  onEdit,
  onDelete,
}: QuestionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'newest' | 'oldest' | 'question' | 'category'
  >('newest');

  // Filter and sort questions
  const processedQuestions = questions
    .filter((question) => {
      const matchesSearch =
        question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.context.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;

      const context = question.context?.toLowerCase() || '';
      const questionText = question.question.toLowerCase();

      if (selectedCategory === 'technical') {
        return (
          context.includes('technical') || questionText.includes('technical')
        );
      }
      if (selectedCategory === 'behavioral') {
        return (
          context.includes('behavioral') || questionText.includes('behavioral')
        );
      }
      if (selectedCategory === 'general') {
        return (
          !context.includes('technical') &&
          !context.includes('behavioral') &&
          !questionText.includes('technical') &&
          !questionText.includes('behavioral')
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'question':
          return a.question.localeCompare(b.question);
        case 'category':
          const getCat = (q: Question) => {
            const ctx = q.context?.toLowerCase() || '';
            const qText = q.question.toLowerCase();
            if (ctx.includes('technical') || qText.includes('technical'))
              return 'technical';
            if (ctx.includes('behavioral') || qText.includes('behavioral'))
              return 'behavioral';
            return 'general';
          };
          return getCat(a).localeCompare(getCat(b));
        default:
          return 0;
      }
    });

  if (questions.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <HelpCircle className="w-12 h-12 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          No questions yet
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
          Create your first interview question to get started. Build a
          comprehensive question bank to improve your interviews.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium border border-blue-200">
            💡 Start with behavioral questions
          </div>
          <div className="flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-medium border border-purple-200">
            🚀 Add technical challenges
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Questions List */}
      <div className="space-y-4">
        {processedQuestions.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No matches found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find what you're
              looking for
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="btn btn-secondary"
            >
              Show all questions
            </button>
          </div>
        ) : (
          processedQuestions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              onEdit={onEdit}
              onDelete={onDelete}
              isExpanded={expandedCard === question.id}
              onToggleExpand={() =>
                setExpandedCard(
                  expandedCard === question.id ? null : question.id
                )
              }
              searchTerm={searchTerm}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  searchTerm: string;
  index: number;
}

function QuestionCard({
  question,
  onEdit,
  onDelete,
  isExpanded,
  onToggleExpand,
  searchTerm,
  index,
}: QuestionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi'
    );
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-yellow-200 text-yellow-900 px-1 rounded font-medium"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this question? This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(question.id);
    } catch (error) {
      console.error('Error deleting question:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get category indicator color and info
  const getCategoryInfo = (text: string, questionText: string) => {
    const lowerText = (text + ' ' + questionText).toLowerCase();
    if (
      lowerText.includes('technical') ||
      lowerText.includes('code') ||
      lowerText.includes('algorithm')
    ) {
      return {
        name: 'Technical',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: '⚡',
      };
    }
    if (
      lowerText.includes('behavioral') ||
      lowerText.includes('team') ||
      lowerText.includes('leadership')
    ) {
      return {
        name: 'Behavioral',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: '💭',
      };
    }
    return {
      name: 'General',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: '💬',
    };
  };

  const categoryInfo = getCategoryInfo(question.context, question.question);

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md group ${
        isDeleting ? 'opacity-50 pointer-events-none' : ''
      }`}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${categoryInfo.color}`}
            >
              <span className="mr-1">{categoryInfo.icon}</span>
              {categoryInfo.name}
            </span>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(question.createdAt)}
            </div>
          </div>

          <button
            onClick={onToggleExpand}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors opacity-70 group-hover:opacity-100"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 text-gray-500 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Question */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 leading-relaxed mb-2">
            {highlightText(question.question, searchTerm)}
          </h3>
          {!isExpanded && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {question.answer.length > 100
                ? `${question.answer.substring(0, 100)}...`
                : question.answer}
            </p>
          )}
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-6 pb-4">
          <div className="space-y-6 border-t border-gray-100 pt-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-semibold text-emerald-700">
                  Expected Answer
                </span>
              </div>
              <div className="ml-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="text-gray-800 leading-relaxed">
                  {highlightText(question.answer, searchTerm)}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-semibold text-amber-700">
                  Context & Notes
                </span>
              </div>
              <div className="ml-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-gray-800 leading-relaxed">
                  {highlightText(question.context, searchTerm)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isExpanded ? (
              <button
                onClick={onToggleExpand}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                View full details
              </button>
            ) : (
              <button
                onClick={onToggleExpand}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                Collapse
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(question)}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              {isDeleting ? (
                <div className="loading-spinner w-4 h-4 border-red-200 border-t-red-600" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}