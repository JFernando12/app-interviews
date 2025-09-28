import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { AWSService, VideoUploadData } from '@/lib/aws';

// POST /api/interviews/upload-video - Generate presigned URL for video upload
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { interview_id, file_name, content_type } = body;

    // Validate required fields
    if (!interview_id || !file_name || !content_type) {
      return NextResponse.json(
        { error: 'interview_id, file_name, and content_type are required' },
        { status: 400 }
      );
    }

    // Validate content type (only allow video formats)
    const allowedContentTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo', // .avi
      'video/webm',
      'video/x-matroska', // .mkv
    ];

    if (!allowedContentTypes.includes(content_type)) {
      return NextResponse.json(
        { error: 'Invalid content type. Only video files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file extension
    const allowedExtensions = ['.mp4', '.mpeg', '.mov', '.avi', '.webm', '.mkv'];
    const fileExtension = file_name.toLowerCase().substring(file_name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Invalid file extension. Allowed: mp4, mpeg, mov, avi, webm' },
        { status: 400 }
      );
    }

    const uploadData: VideoUploadData = {
      interview_id,
      user_id: session.user.id,
      file_name,
      content_type,
    };

    const { upload_url, video_path } = await AWSService.generatePresignedUrl(
      uploadData,
      3600 // 1 hour expiration
    );

    return NextResponse.json({
      upload_url,
      video_path,
      expires_in: 3600,
    });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}