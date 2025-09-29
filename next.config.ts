import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output configuration for Amplify deployment
  output: 'standalone',
  
  // Image optimization settings for Amplify
  images: {
    unoptimized: true,
    domains: [
      // Add any external image domains you're using
      'lh3.googleusercontent.com', // Google profile images
      's3.amazonaws.com',
      // Add your S3 bucket domain if serving images from S3
    ],
  },

  // Environment variables validation
  env: {
    // AWS Configuration
    NEXT_AWS_REGION: process.env.NEXT_AWS_REGION,
    NEXT_AWS_ACCESS_KEY_ID: process.env.NEXT_AWS_ACCESS_KEY_ID,
    NEXT_AWS_SECRET_ACCESS_KEY: process.env.NEXT_AWS_SECRET_ACCESS_KEY,
    
    // S3 Configuration
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    
    // SQS Configuration
    SQS_QUEUE_URL_VIDEOS: process.env.SQS_QUEUE_URL_VIDEOS,
    
    // DynamoDB Tables
    DYNAMODB_AUTH_TABLE_NAME: process.env.DYNAMODB_AUTH_TABLE_NAME,
    DYNAMODB_QUESTIONS_TABLE_NAME: process.env.DYNAMODB_QUESTIONS_TABLE_NAME,
    DYNAMODB_INTERVIEWS_TABLE_NAME: process.env.DYNAMODB_INTERVIEWS_TABLE_NAME,
    
    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    
    // NextAuth Configuration
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    
    // Public environment variables
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Experimental features for better performance
  experimental: {
    // Enable server components caching
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },

  // Webpack configuration for better bundle optimization
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Headers for security and CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXTAUTH_URL || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Redirects for better SEO and UX
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
