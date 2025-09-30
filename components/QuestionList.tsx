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
      <div className="space-y-3 sm:space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-start space-x-2 sm:space-x-4 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0"></div>
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="w-full sm:w-3/4 h-4 sm:h-5 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  <div className="w-full sm:w-1/2 h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <div className="w-12 sm:w-16 h-2 sm:h-3 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                    <div className="w-16 sm:w-20 h-2 sm:h-3 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                    <div className="w-10 sm:w-14 h-2 sm:h-3 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1 sm:space-x-2 sm:flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 lg:py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <HelpCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
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
      <div className="space-y-3 sm:space-y-4">
        {questions.map((question) => (
          <div
            key={question.id}
            className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0 mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="text-blue-600 dark:text-blue-400">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 lg:gap-4 text-xs text-gray-500 dark:text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                    <span className="text-xs">
                      {formatDate(question.created_at)}
                    </span>
                  </div>
                  {question.programming_language && (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                      {question.programming_language}
                    </span>
                  )}
                  {question.type && (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs">
                      {QuestionTypeUtils.getDisplayName(question.type)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => onEdit(question)}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                  title="Edit question"
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                <button
                  onClick={() => onDelete(question.id)}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  title="Delete question"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Context */}
              {question.context && (
                <div className="mb-3 sm:mb-4">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                    Context
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {question.context}
                  </p>
                </div>
              )}

              {/* Question */}
              <div className="mb-3 sm:mb-4">
                <h4 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                  Question
                </h4>
                <p className="text-gray-800 dark:text-gray-200 text-base sm:text-lg font-medium leading-relaxed whitespace-pre-wrap">
                  {question.question}
                </p>
              </div>

              {/* Answer */}
              <div className="mb-3 sm:mb-4">
                <h4 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                  Answer
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {question.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Normal Mode Layout (Original Design with Expandable Features)
  return (
    <div className="space-y-3 sm:space-y-4">
      {questions.map((question) => {
        const typeInfo = {
          name: question.type,
        };

        return (
          <div
            key={question.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-start space-x-2 sm:space-x-4 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                    {shouldTruncate(question.question, 150) &&
                    !isExpanded(question.id, 'question') ? (
                      <>
                        {truncateText(question.question, 150)}
                        <button
                          onClick={() =>
                            toggleExpansion(question.id, 'question')
                          }
                          className="ml-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 inline-flex items-center"
                        >
                          <ChevronDown className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                          Show more
                        </button>
                      </>
                    ) : (
                      <>
                        {question.question}
                        {shouldTruncate(question.question, 150) && (
                          <button
                            onClick={() =>
                              toggleExpansion(question.id, 'question')
                            }
                            className="ml-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 inline-flex items-center"
                          >
                            <ChevronUp className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                            Show less
                          </button>
                        )}
                      </>
                    )}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">
                    {shouldTruncate(question.answer, 200) &&
                    !isExpanded(question.id, 'answer') ? (
                      <>
                        {truncateText(question.answer, 200)}
                        <button
                          onClick={() => toggleExpansion(question.id, 'answer')}
                          className="ml-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 inline-flex items-center"
                        >
                          <ChevronDown className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                          Show more
                        </button>
                      </>
                    ) : (
                      <>
                        {question.answer}
                        {shouldTruncate(question.answer, 200) && (
                          <button
                            onClick={() =>
                              toggleExpansion(question.id, 'answer')
                            }
                            className="ml-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 inline-flex items-center"
                          >
                            <ChevronUp className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                            Show less
                          </button>
                        )}
                      </>
                    )}
                  </p>

                  {question.context && (
                    <div className="mb-3 sm:mb-4">
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 font-medium">
                        Context:
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                        {shouldTruncate(question.context, 150) &&
                        !isExpanded(question.id, 'context') ? (
                          <>
                            {truncateText(question.context, 150)}
                            <button
                              onClick={() =>
                                toggleExpansion(question.id, 'context')
                              }
                              className="ml-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 inline-flex items-center"
                            >
                              <ChevronDown className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                              Show more
                            </button>
                          </>
                        ) : (
                          <>
                            {question.context}
                            {shouldTruncate(question.context, 150) && (
                              <button
                                onClick={() =>
                                  toggleExpansion(question.id, 'context')
                                }
                                className="ml-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 inline-flex items-center"
                              >
                                <ChevronUp className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                Show less
                              </button>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 lg:gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                      <span className="text-xs">
                        {formatDate(question.created_at)}
                      </span>
                    </div>
                    {question.programming_language && (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                        {question.programming_language}
                      </span>
                    )}
                    {question.type && (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs">
                        {QuestionTypeUtils.getDisplayName(question.type)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                <button
                  onClick={() => onEdit(question)}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                  title="Edit question"
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                <button
                  onClick={() => onDelete(question.id)}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  title="Delete question"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}