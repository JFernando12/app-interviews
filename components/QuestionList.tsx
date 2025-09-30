'use client';

import { useState } from 'react';
import { Question } from '@/lib/dynamodb';
import { QuestionTypeUtils } from '@/types/enums';
import {
  HelpCircle,
  Edit,
  Trash2,
  Calendar,
  Code,
  Users,
  Target,
  Zap,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';

interface QuestionListProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  studyMode?: boolean;
}

export default function QuestionList({
  questions,
  onEdit,
  onDelete,
  isLoading = false,
  studyMode = false,
}: QuestionListProps) {
  const [expandedItems, setExpandedItems] = useState<{
    [questionId: string]: {
      context?: boolean;
      question?: boolean;
      answer?: boolean;
    };
  }>({});

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleExpansion = (
    questionId: string,
    field: 'context' | 'question' | 'answer'
  ) => {
    setExpandedItems((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: !prev[questionId]?.[field],
      },
    }));
  };

  const isExpanded = (
    questionId: string,
    field: 'context' | 'question' | 'answer'
  ) => {
    return expandedItems[questionId]?.[field] || false;
  };

  const shouldTruncate = (text: string, maxLength: number = 150) => {
    return text.length > maxLength;
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  const renderExpandableText = (
    text: string,
    questionId: string,
    field: 'context' | 'question' | 'answer',
    label: string,
    maxLength: number = 150
  ) => {
    if (!text) return null;

    const expanded = isExpanded(questionId, field);
    const needsTruncation = shouldTruncate(text, maxLength);
    const displayText =
      studyMode || expanded || !needsTruncation
        ? text
        : truncateText(text, maxLength);

    return (
      <div className="mb-4">
        {label && (
          <h4 className={`font-semibold text-gray-700 dark:text-gray-300 mb-2 ${studyMode ? 'text-base mb-3' : 'text-sm'}`}>
            {label}
          </h4>
        )}
        <p className={`text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap ${studyMode ? 'text-base' : 'text-sm'}`}>
          {displayText}
        </p>
        {!studyMode && needsTruncation && (
          <button
            onClick={() => toggleExpansion(questionId, field)}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show more
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 animate-pulse"
          >
            <div className="flex items-start justify-between space-x-4">
              <div className="space-y-3 flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded-full w-16"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded-full w-20"></div>
                </div>
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <HelpCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">
          No questions yet
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Create your first question to get started.
        </p>
      </div>
    );
  }

  // Study Mode Layout
  if (studyMode) {
    return (
      <div className="space-y-4">
        {questions.map((question) => (
          <div
            key={question.id}
            className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-blue-600 dark:text-blue-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(question.created_at)}</span>
                  </div>
                  {question.programming_language && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                      {question.programming_language}
                    </span>
                  )}
                  {question.type && (
                    <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                      {QuestionTypeUtils.getDisplayName(question.type)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => onEdit(question)}
                  className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                  title="Edit question"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(question.id)}
                  className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  title="Delete question"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Context */}
              {question.context && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Context
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {question.context}
                  </p>
                </div>
              )}

              {/* Question */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Question
                </h4>
                <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-relaxed whitespace-pre-wrap">
                  {question.question}
                </p>
              </div>

              {/* Answer */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Answer
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {question.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Normal Mode Layout
  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <div
          key={question.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {shouldTruncate(question.question, 150) &&
                !isExpanded(question.id, 'question') ? (
                  <>
                    {truncateText(question.question, 150)}
                    <button
                      onClick={() => toggleExpansion(question.id, 'question')}
                      className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 inline-flex items-center"
                    >
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show more
                    </button>
                  </>
                ) : (
                  <>
                    {question.question}
                    {shouldTruncate(question.question, 150) && (
                      <button
                        onClick={() => toggleExpansion(question.id, 'question')}
                        className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 inline-flex items-center"
                      >
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Show less
                      </button>
                    )}
                  </>
                )}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4">
                {shouldTruncate(question.answer, 200) &&
                !isExpanded(question.id, 'answer') ? (
                  <>
                    {truncateText(question.answer, 200)}
                    <button
                      onClick={() => toggleExpansion(question.id, 'answer')}
                      className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 inline-flex items-center"
                    >
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show more
                    </button>
                  </>
                ) : (
                  <>
                    {question.answer}
                    {shouldTruncate(question.answer, 200) && (
                      <button
                        onClick={() => toggleExpansion(question.id, 'answer')}
                        className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 inline-flex items-center"
                      >
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Show less
                      </button>
                    )}
                  </>
                )}
              </p>

              {question.context && (
                <div className="mb-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 font-medium">
                    Context:
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {shouldTruncate(question.context, 150) &&
                    !isExpanded(question.id, 'context') ? (
                      <>
                        {truncateText(question.context, 150)}
                        <button
                          onClick={() => toggleExpansion(question.id, 'context')}
                          className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 inline-flex items-center"
                        >
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Show more
                        </button>
                      </>
                    ) : (
                      <>
                        {question.context}
                        {shouldTruncate(question.context, 150) && (
                          <button
                            onClick={() => toggleExpansion(question.id, 'context')}
                            className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 inline-flex items-center"
                          >
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Show less
                          </button>
                        )}
                      </>
                    )}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(question.created_at)}</span>
                </div>
                {question.programming_language && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                    {question.programming_language}
                  </span>
                )}
                {question.type && (
                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                    {QuestionTypeUtils.getDisplayName(question.type)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
              <button
                onClick={() => onEdit(question)}
                className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                title="Edit question"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(question.id)}
                className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                title="Delete question"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}