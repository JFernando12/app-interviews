// Script to insert 100 Python interview questions into the database
// Run this script with: node scripts/insert-python-questions.js

const pythonQuestions = require('./python-questions.js');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const BATCH_SIZE = 10; // Process questions in batches to avoid overwhelming the server

// Use dynamic import for node-fetch in Node.js
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function insertPythonQuestions() {
  console.log('Starting Python questions insertion...');
  console.log(`Total questions to insert: ${pythonQuestions.length}`);

  const fetch = await getFetch();

  // Transform questions to match API format
  const formattedQuestions = pythonQuestions.map((q, index) => ({
    question: q.question,
    answer: q.answer,
    context: q.context,
    programming_language: 'python',
    // Note: type will be set to TECHNICAL by default in the API
    // difficulty is stored in context for reference
  }));

  try {
    // Process questions in batches
    const batches = [];
    for (let i = 0; i < formattedQuestions.length; i += BATCH_SIZE) {
      batches.push(formattedQuestions.slice(i, i + BATCH_SIZE));
    }

    console.log(`Processing ${batches.length} batches of ${BATCH_SIZE} questions each...`);

    let totalCreated = 0;
    let totalErrors = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}...`);

      try {
        const response = await fetch(`${API_BASE_URL}/api/questions/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questions: batch,
            global: true, // These are global questions for the home page
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`Batch ${batchIndex + 1} completed: ${result.created} created, ${result.failed || 0} failed`);
          totalCreated += result.created;
          totalErrors += result.failed || 0;

          if (result.errors && result.errors.length > 0) {
            console.warn('Errors in batch:', result.errors);
          }
        } else {
          const errorText = await response.text();
          console.error(`Batch ${batchIndex + 1} failed:`, response.status, errorText);
          totalErrors += batch.length;
        }
      } catch (error) {
        console.error(`Error processing batch ${batchIndex + 1}:`, error.message);
        totalErrors += batch.length;
      }

      // Add a small delay between batches to be nice to the server
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('\n=== INSERTION SUMMARY ===');
    console.log(`Total questions processed: ${pythonQuestions.length}`);
    console.log(`Successfully created: ${totalCreated}`);
    console.log(`Failed: ${totalErrors}`);
    console.log(`Success rate: ${((totalCreated / pythonQuestions.length) * 100).toFixed(2)}%`);

    if (totalCreated === pythonQuestions.length) {
      console.log('✅ All Python questions inserted successfully!');
    } else if (totalCreated > 0) {
      console.log('⚠️  Some questions were inserted, but there were errors.');
    } else {
      console.log('❌ No questions were inserted successfully.');
    }

  } catch (error) {
    console.error('Fatal error during insertion:', error);
    process.exit(1);
  }
}

// Helper function to validate the API is accessible
async function validateAPI() {
  try {
    const fetch = await getFetch();
    console.log('Validating API accessibility...');
    const response = await fetch(`${API_BASE_URL}/api/questions?global=true&programming_language=python&limit=1`);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    console.log('✅ API is accessible');
    return true;
  } catch (error) {
    console.error('❌ API validation failed:', error.message);
    console.error('Make sure your server is running and accessible at:', API_BASE_URL);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🐍 Python Interview Questions Insertion Script');
  console.log('==========================================\n');

  // Validate API first
  const apiValid = await validateAPI();
  if (!apiValid) {
    process.exit(1);
  }

  // Insert questions
  await insertPythonQuestions();
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { insertPythonQuestions };