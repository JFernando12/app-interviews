'use client';

import { useState, useRef } from 'react';
import { Upload, Video, CheckCircle, AlertCircle, X } from 'lucide-react';

interface VideoUploaderProps {
  onVideoUploaded: (videoPath: string) => void;
  onUploadStart?: () => void;
  onUploadError?: (error: string) => void;
  interviewId: string;
  disabled?: boolean;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export default function VideoUploader({
  onVideoUploaded,
  onUploadStart,
  onUploadError,
  interviewId,
  disabled = false,
}: VideoUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allowed video formats
  const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
  const maxSize = 500 * 1024 * 1024; // 500MB

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please select a video file (MP4, MPEG, MOV, AVI, WebM)');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 500MB');
      return;
    }

    setSelectedFile(file);
    setError('');
    setUploadComplete(false);
  };

  const uploadVideo = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    onUploadStart?.();

    try {
      // Step 1: Get presigned URL
      const presignedResponse = await fetch('/api/interviews/upload-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interview_id: interviewId,
          file_name: selectedFile.name,
          content_type: selectedFile.type,
        }),
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { upload_url, video_path } = await presignedResponse.json();

      // Step 2: Upload file to S3 with progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setUploadProgress({
            loaded: event.loaded,
            total: event.total,
            percentage,
          });
        }
      });

      xhr.onload = async () => {
        if (xhr.status === 200) {
          try {
            // Step 3: Notify backend that upload is complete
            const processResponse = await fetch('/api/interviews/process-video', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                interview_id: interviewId,
                video_path: video_path,
              }),
            });

            if (!processResponse.ok) {
              const errorData = await processResponse.json();
              throw new Error(errorData.error || 'Failed to process video');
            }

            setUploadComplete(true);
            onVideoUploaded(video_path);
          } catch (processError) {
            console.error('Process error:', processError);
            setError(processError instanceof Error ? processError.message : 'Failed to process video');
            onUploadError?.(error);
          }
        } else {
          setError('Upload failed');
          onUploadError?.('Upload failed');
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        setError('Upload failed');
        onUploadError?.('Upload failed');
        setUploading(false);
      };

      xhr.open('PUT', upload_url);
      xhr.setRequestHeader('Content-Type', selectedFile.type);
      xhr.send(selectedFile);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      onUploadError?.(errorMessage);
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setUploadProgress({ loaded: 0, total: 0, percentage: 0 });
    setUploadComplete(false);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Upload Interview Video
        </h3>
        {uploadComplete && (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5 mr-1" />
            <span className="text-sm">Upload Complete</span>
          </div>
        )}
      </div>

      {!selectedFile ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Select a video file to upload
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Supported formats: MP4, MPEG, MOV, AVI, WebM (Max 500MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Choose Video File
          </button>
        </div>
      ) : (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Video className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedFile.name}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                ({formatFileSize(selectedFile.size)})
              </span>
            </div>
            {!uploading && !uploadComplete && (
              <button
                type="button"
                onClick={clearSelection}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {uploading && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {!uploadComplete && !uploading && (
            <button
              type="button"
              onClick={uploadVideo}
              disabled={disabled}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-colors"
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Upload Video
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}