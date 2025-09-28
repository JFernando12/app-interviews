'use client';

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
} from 'lucide-react';

interface QuestionListProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export default function QuestionList({
  questions,
  onEdit,
  onDelete,
  isLoading = false,
}: QuestionListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getQuestionTypeInfo = (question: Question) => {
    const context = question.context?.toLowerCase() || '';
    const questionText = question.question.toLowerCase();

    if (context.includes('behavioral') || questionText.includes('behavioral')) {
      return {
        name: 'Behavioral',
        icon: Users,
        color:
          'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      };
    }
    if (
      context.includes('system') ||
      context.includes('design') ||
      questionText.includes('system') ||
      questionText.includes('design')
    ) {
      return {
        name: 'System Design',
        icon: Target,
        color:
          'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      };
    }
    if (
      context.includes('leadership') ||
      context.includes('management') ||
      questionText.includes('leadership') ||
      questionText.includes('management')
    ) {
      return {
        name: 'Leadership',
        icon: Zap,
        color:
          'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
      };
    }
    if (
      context.includes('technical') ||
      questionText.includes('technical') ||
      context.includes('coding') ||
      questionText.includes('coding')
    ) {
      return {
        name: 'Technical',
        icon: Code,
        color:
          'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      };
    }

    return {
      name: 'General',
      icon: MessageSquare,
      color: 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400',
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                <div className="space-y-2 flex-1">
                  <div className="w-3/4 h-5 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  <div className="flex space-x-2">
                    <div className="w-16 h-3 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                    <div className="w-20 h-3 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                    <div className="w-14 h-3 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No questions yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Create your first question to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => {
        const typeInfo = getQuestionTypeInfo(question);
        const IconComponent = typeInfo.icon;

        return (
          <div
            key={question.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${typeInfo.color}`}
                >
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {question.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {question.answer}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(question.createdAt)}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}
                    >
                      {typeInfo.name}
                    </span>
                    {question.programming_language && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                        {question.programming_language}
                      </span>
                    )}
                    {question.type && (
                      <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs">
                        {QuestionTypeUtils.getDisplayName(question.type)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
        );
      })}
    </div>
  );
}