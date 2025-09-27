'use client';

import { Question } from '@/lib/dynamodb';

interface QuestionListProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

export default function QuestionList({ questions, onEdit, onDelete }: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 text-lg">No questions found</div>
        <p className="text-gray-400 mt-2">Add your first question using the form on the left.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

function QuestionCard({ question, onEdit, onDelete }: QuestionCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Question */}
        <div>
          <h3 className="font-medium text-gray-900 mb-1">Question:</h3>
          <p className="text-gray-700 text-sm">{question.question}</p>
        </div>

        {/* Answer */}
        <div>
          <h4 className="font-medium text-gray-900 mb-1">Answer:</h4>
          <p className="text-gray-700 text-sm">{question.answer}</p>
        </div>

        {/* Context */}
        <div>
          <h4 className="font-medium text-gray-900 mb-1">Context:</h4>
          <p className="text-gray-700 text-sm">{question.context}</p>
        </div>

        {/* Metadata and Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <div>Created: {formatDate(question.createdAt)}</div>
            {question.updatedAt !== question.createdAt && (
              <div>Updated: {formatDate(question.updatedAt)}</div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(question)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(question.id)}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}