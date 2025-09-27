'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/lib/dynamodb';
import QuestionForm from '@/components/QuestionForm';
import QuestionList from '@/components/QuestionList';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/questions');
      if (!response.ok) {
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

  // Create or update a question
  const saveQuestion = async (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => {
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
        throw new Error(`Failed to ${editingQuestion ? 'update' : 'create'} question`);
      }

      await fetchQuestions();
      setEditingQuestion(null);
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
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingQuestion(null);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Questions Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={() => setError(null)}
            className="float-right text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Question Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </h2>
          <QuestionForm
            initialData={editingQuestion || undefined}
            onSubmit={saveQuestion}
            onCancel={editingQuestion ? cancelEdit : undefined}
          />
        </div>

        {/* Question List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Questions List</h2>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <QuestionList
              questions={questions}
              onEdit={editQuestion}
              onDelete={deleteQuestion}
            />
          )}
        </div>
      </div>
    </div>
  );
}