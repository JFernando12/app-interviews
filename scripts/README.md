# Python Interview Questions Scripts

This directory contains scripts to populate the database with 100 common Python interview questions.

## Files

- `python-questions.js` - Contains 100 Python interview questions organized by difficulty (Easy: 1-35, Medium: 36-70, Hard: 71-100)
- `insert-python-questions.js` - Node.js script to insert questions into the database
- `insert-python-questions.ps1` - PowerShell script for easy execution on Windows

## Prerequisites

1. **Development server must be running**
   ```bash
   npm run dev
   ```

2. **Node.js and npm installed**
   - The script uses node-fetch for API calls

## Usage

### Option 1: PowerShell Script (Windows - Recommended)
```powershell
# From the project root directory
./scripts/insert-python-questions.ps1
```

### Option 2: Node.js Script (Cross-platform)
```bash
# Install dependencies first
npm install node-fetch

# Run the script
node scripts/insert-python-questions.js
```

### Option 3: Manual API Call
You can also use the bulk API endpoint directly:

```bash
curl -X POST http://localhost:3000/api/questions/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "questions": [/* array of questions */],
    "global": true
  }'
```

## Script Features

- **Batch Processing**: Questions are processed in batches of 10 to avoid overwhelming the server
- **Error Handling**: Individual question failures don't stop the entire process
- **Progress Reporting**: Real-time feedback on insertion progress
- **API Validation**: Checks if the server is accessible before starting
- **Detailed Summary**: Shows success/failure statistics at the end

## Question Format

Each question in the database will have:
- `question`: The interview question text
- `answer`: Detailed answer explanation
- `context`: Additional context about the topic
- `type`: Set to "TECHNICAL"
- `programming_language`: Set to "python"
- `global`: Set to true (available to all users)
- `difficulty`: Stored in context (easy/medium/hard)

## Question Categories

### Easy Questions (1-35)
- Python basics, syntax, data types
- Basic OOP concepts
- Simple control structures
- Built-in functions and methods

### Medium Questions (36-70)
- Advanced Python features (decorators, generators, context managers)
- Object-oriented programming
- Memory management
- Standard library modules
- Testing and debugging

### Hard Questions (71-100)
- Python internals and advanced concepts
- Performance optimization
- Concurrency and parallelism
- Design patterns
- Production deployment considerations

## Troubleshooting

1. **"API is not accessible" error**
   - Make sure the development server is running (`npm run dev`)
   - Check that the server is accessible at `http://localhost:3000`

2. **"node-fetch not found" error**
   - Run `npm install node-fetch` to install the dependency

3. **Permission errors on PowerShell**
   - Run PowerShell as Administrator
   - Or set execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

4. **Some questions failed to insert**
   - Check the error messages in the console output
   - Verify database connection and credentials
   - Ensure the questions table exists in DynamoDB

## Database Schema

The questions will be stored in the DynamoDB table with the following structure:
```typescript
{
  id: string,                    // Auto-generated UUID
  question: string,              // Question text
  answer: string,                // Answer text
  context: string,               // Additional context
  type: QuestionType.TECHNICAL,  // Question type
  programming_language: "python", // Programming language
  global: true,                  // Available to all users
  created_at: string,            // ISO timestamp
  updated_at: string             // ISO timestamp
}
```

## Next Steps

After successfully inserting the questions:

1. Navigate to the Technical page in your app
2. Select "Python" from the technology filter
3. You should see the 100 Python questions loaded from the database
4. The mock data is no longer used - all questions come from the real database

## Adding More Questions

To add more questions or questions for other programming languages:

1. Create a new questions file (e.g., `javascript-questions.js`)
2. Modify the insertion script to use the new questions file
3. Update the `programming_language` field accordingly
4. Run the insertion script

## Support

If you encounter any issues:
1. Check the console output for detailed error messages
2. Verify your database configuration
3. Ensure all prerequisites are met
4. Check the API endpoint responses manually if needed