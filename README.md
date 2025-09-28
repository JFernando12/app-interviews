# Interview Questions App

A Next.js application for managing interview questions with DynamoDB storage. This app provides full CRUD operations for questions with the following structure:

```json
{
  "id": "unique-uuid",
  "question": "Question text",
  "answer": "Answer text", 
  "context": "Additional context or background information",
  "created_at": "2025-09-27T10:30:00.000Z",
  "updated_at": "2025-09-27T10:30:00.000Z"
}
```

## Features

- ✅ Create new questions
- ✅ View all questions
- ✅ Edit existing questions
- ✅ Delete questions
- ✅ Form validation
- ✅ Responsive design with Tailwind CSS
- ✅ DynamoDB integration

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: AWS DynamoDB
- **AWS SDK**: @aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure your AWS credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your AWS configuration:

```env
# DynamoDB Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
DYNAMODB_TABLE_NAME=questions

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Create DynamoDB Table

You have two options to create the DynamoDB table:

#### Option A: Using AWS CLI
```bash
aws dynamodb create-table \
    --table-name questions \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

#### Option B: Using the included script
```bash
npx tsx scripts/create-table.ts
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app-interviews/
├── app/
│   ├── api/
│   │   └── questions/
│   │       ├── route.ts          # GET, POST /api/questions
│   │       └── [id]/
│   │           └── route.ts      # GET, PUT, DELETE /api/questions/[id]
│   ├── (root)/
│   │   └── questions/
│   │       └── page.tsx          # Questions management page
│   ├── layout.tsx
│   └── page.tsx                  # Home page
├── components/
│   ├── QuestionForm.tsx          # Form for creating/editing questions
│   └── QuestionList.tsx          # List and display questions
├── lib/
│   └── dynamodb.ts               # DynamoDB service and utilities
└── scripts/
    └── create-table.ts           # Script to create DynamoDB table
```

## API Endpoints

### GET /api/questions
Get all questions.

**Response:**
```json
[
  {
    "id": "uuid",
    "question": "Question text",
    "answer": "Answer text",
    "context": "Context text",
    "created_at": "2025-09-27T10:30:00.000Z",
    "updated_at": "2025-09-27T10:30:00.000Z"
  }
]
```

### POST /api/questions
Create a new question.

**Request Body:**
```json
{
  "question": "Question text",
  "answer": "Answer text",
  "context": "Context text"
}
```

**Response:** Created question object with generated ID and timestamps.

### GET /api/questions/[id]
Get a specific question by ID.

**Response:** Question object or 404 if not found.

### PUT /api/questions/[id]
Update a specific question. You can update any combination of question, answer, and context fields.

**Request Body:**
```json
{
  "question": "Updated question text",
  "answer": "Updated answer text",
  "context": "Updated context text"
}
```

**Response:** Updated question object or 404 if not found.

### DELETE /api/questions/[id]
Delete a specific question.

**Response:** Success message or 404 if not found.

## AWS DynamoDB Table Schema

The DynamoDB table uses the following schema:

- **Table Name**: `questions` (configurable via environment)
- **Partition Key**: `id` (String) - UUID generated for each question
- **Billing Mode**: Pay-per-request (no provisioned capacity needed)

## Form Validation

The question form includes client-side validation:

- **Question**: Required, minimum 5 characters
- **Answer**: Required, minimum 5 characters  
- **Context**: Required, minimum 10 characters

## Error Handling

The application includes comprehensive error handling:

- API errors are caught and displayed to the user
- Form validation prevents invalid submissions
- Network errors show user-friendly messages
- DynamoDB errors are logged and handled gracefully

## Development

To start development:

1. Make sure your AWS credentials are configured
2. Ensure the DynamoDB table exists
3. Run `npm run dev`
4. Navigate to `/questions` to start managing questions

## Deployment

For production deployment, ensure:

1. AWS credentials are properly configured in your hosting environment
2. Environment variables are set correctly
3. DynamoDB table exists in the specified region
4. AWS IAM permissions are configured for DynamoDB operations

## AWS Permissions Required

Your AWS IAM user/role needs the following DynamoDB permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:Scan",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem"
            ],
            "Resource": "arn:aws:dynamodb:*:*:table/questions"
        }
    ]
}
```
