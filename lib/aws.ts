import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

// Configure AWS clients
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// S3 configuration
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const S3_VIDEO_PREFIX = 'videos/';

// SQS configuration
const SQS_QUEUE_URL_VIDEOS = process.env.SQS_QUEUE_URL_VIDEOS!;

export interface VideoUploadData {
  interview_id: string;
  user_id: string;
  file_name: string;
  content_type: string;
}

export interface SQSMessage {
  interview_id: string;
  video_path: string;
  user_id: string;
  timestamp: string;
}

export class AWSService {
  /**
   * Generate a presigned URL for video upload to S3
   */
  static async generatePresignedUrl(
    uploadData: VideoUploadData,
    expiresIn: number = 3600 // 1 hour default
  ): Promise<{ upload_url: string; video_path: string }> {
    const timestamp = Date.now();
    const video_path = `${S3_VIDEO_PREFIX}${uploadData.user_id}/${uploadData.interview_id}/${timestamp}_${uploadData.file_name}`;
    
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: video_path,
      ContentType: uploadData.content_type,
      Metadata: {
        user_id: uploadData.user_id,
        interview_id: uploadData.interview_id,
        uploaded_at: new Date().toISOString(),
      },
      // Add CORS-related headers
      CacheControl: 'no-cache',
    });

    const upload_url = await getSignedUrl(s3Client, command, { 
      expiresIn,
      // Ensure the presigned URL includes necessary headers
      signableHeaders: new Set(['content-type', 'cache-control'])
    });

    return {
      upload_url,
      video_path,
    };
  }

  /**
   * Send message to SQS queue for video processing
   */
  static async sendVideoProcessingMessage(message: SQSMessage): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: SQS_QUEUE_URL_VIDEOS,
      MessageBody: JSON.stringify(message),
      MessageAttributes: {
        interview_id: {
          StringValue: message.interview_id,
          DataType: 'String',
        },
        user_id: {
          StringValue: message.user_id,
          DataType: 'String',
        },
        video_path: {
          StringValue: message.video_path,
          DataType: 'String',
        },
      },
    });

    await sqsClient.send(command);
  }

  /**
   * Helper method to extract video key from S3 URL or path
   */
  static extractVideoKey(videoPath: string): string {
    // Remove bucket name if full URL is provided
    if (videoPath.includes(S3_BUCKET_NAME)) {
      return videoPath.split(`${S3_BUCKET_NAME}/`)[1] || videoPath;
    }
    
    // Return the path as-is if it's already a key
    return videoPath.startsWith(S3_VIDEO_PREFIX) ? videoPath : `${S3_VIDEO_PREFIX}${videoPath}`;
  }

  /**
   * Get the full S3 URL for a video
   */
  static getVideoUrl(videoPath: string): string {
    const key = this.extractVideoKey(videoPath);
    return `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }
}

export { s3Client, sqsClient };