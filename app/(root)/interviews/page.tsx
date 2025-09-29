'use client';

import { useState, useEffect } from 'react';
import { Interview } from '@/lib/dynamodb';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';
import InterviewForm from '@/components/InterviewForm';
import InterviewList from '@/components/InterviewList';
import Modal from '@/components/Modal';

interface InterviewFormData {
  company: string;
  type?: string;
  programming_language?: string;
  public?: boolean;
  anonymous?: boolean;
  questions: Array<{
    context: string;
    question: string;
    answer: string;
    type?: string;
    programming_language?: string;
  }>;
  videoFile?: File; // Add video file property
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(
    null
  );
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Fetch interviews
  const fetchInterviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/interviews');
      if (!response.ok) {
        throw new Error('Failed to fetch interviews');
      }
      const data = await response.json();
      setInterviews(data);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      showNotification('error', 'Failed to load interviews');
    } finally {
      setIsLoading(false);
    }
  };

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (formData: InterviewFormData) => {
    try {
      if (editingInterview) {
        // Update existing interview (questions are not updated via this flow)
        const response = await fetch(`/api/interviews/${editingInterview.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: formData.company,
            programming_language: formData.programming_language,
            type: formData.type,
            public: formData.public,
            anonymous: formData.anonymous,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update interview');
        }

        const updatedInterview = await response.json();
        setInterviews((prev) =>
          prev.map((interview) =>
            interview.id === editingInterview.id ? updatedInterview : interview
          )
        );
        showNotification('success', 'Interview updated successfully');
      } else {
        // Create new interview
        const response = await fetch('/api/interviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: formData.company,
            type: formData.type,
            programming_language: formData.programming_language,
            public: formData.public,
            anonymous: formData.anonymous,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create interview');
        }

        const newInterview = await response.json();

        // If there are questions, create them
        let questionsCreated = 0;
        if (formData.questions && formData.questions.length > 0) {
          try {
            const questionsResponse = await fetch('/api/questions/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                interview_id: newInterview.id,
                questions: formData.questions.map((q) => ({
                  question: q.question,
                  answer: q.answer,
                  context: q.context,
                  type: q.type,
                  programming_language: q.programming_language,
                })),
              }),
            });

            if (questionsResponse.ok) {
              const questionsResult = await questionsResponse.json();
              questionsCreated = questionsResult.created || 0;
            } else {
              console.error('Failed to create questions');
            }
          } catch (error) {
            console.error('Error creating questions:', error);
          }
        }

        // If there's a video file, upload it and send to queue
        let videoProcessed = false;
        if (formData.videoFile) {
          try {
            // Step 1: Get presigned URL
            const presignedResponse = await fetch(
              '/api/interviews/upload-video',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  interview_id: newInterview.id,
                  file_name: formData.videoFile.name,
                  content_type: formData.videoFile.type,
                }),
              }
            );

            if (presignedResponse.ok) {
              const { upload_url, video_path } = await presignedResponse.json();

              // Step 2: Upload to S3
              const uploadResponse = await fetch(upload_url, {
                method: 'PUT',
                headers: {
                  'Content-Type': formData.videoFile.type,
                },
                body: formData.videoFile,
              });

              if (uploadResponse.ok) {
                // Step 3: Send to processing queue
                const processResponse = await fetch(
                  '/api/interviews/process-video',
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      interview_id: newInterview.id,
                      video_path: video_path,
                    }),
                  }
                );

                if (processResponse.ok) {
                  videoProcessed = true;
                } else {
                  console.error('Failed to process video');
                }
              } else {
                console.error('Failed to upload video to S3');
              }
            } else {
              console.error('Failed to get presigned URL');
            }
          } catch (error) {
            console.error('Error processing video:', error);
          }
        }

        setInterviews((prev) => [newInterview, ...prev]);

        // Show appropriate success message
        if (videoProcessed) {
          showNotification(
            'success',
            questionsCreated > 0
              ? `Interview created successfully with ${questionsCreated} questions and video processing started`
              : 'Interview created successfully and video processing started'
          );
        } else if (questionsCreated > 0) {
          showNotification(
            'success',
            `Interview created successfully with ${questionsCreated} questions`
          );
        } else {
          showNotification('success', 'Interview created successfully');
        }
      }

      closeForm();
    } catch (error) {
      console.error('Error submitting interview:', error);
      showNotification(
        'error',
        editingInterview
          ? 'Failed to update interview'
          : 'Failed to create interview'
      );
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this interview? This will also delete all associated questions. This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/interviews/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete interview');
      }

      setInterviews((prev) => prev.filter((interview) => interview.id !== id));
      showNotification(
        'success',
        'Interview and associated questions deleted successfully'
      );
    } catch (error) {
      console.error('Error deleting interview:', error);
      showNotification('error', 'Failed to delete interview');
    }
  };

  // Open create form
  const openCreateForm = () => {
    setEditingInterview(null);
    setIsFormOpen(true);
  };

  // Close form
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingInterview(null);
  };

  // Handle edit
  const handleEdit = (interview: Interview) => {
    setEditingInterview(interview);
    setIsFormOpen(true);
  };

  // Load interviews on component mount
  useEffect(() => {
    fetchInterviews();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Interviews
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your interview sessions and track companies here.
                </p>
              </div>
              <button
                onClick={openCreateForm}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  New Interview
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

        {/* Interview List */}
        <InterviewList
          interviews={interviews}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        {/* Form Modal */}
        <Modal
          isOpen={isFormOpen}
          onClose={closeForm}
          title={editingInterview ? 'Edit Interview' : 'Create New Interview'}
        >
          <InterviewForm
            initialData={editingInterview || undefined}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            mode={editingInterview ? 'edit' : 'create'}
          />
        </Modal>
      </div>
    </div>
  );
}
