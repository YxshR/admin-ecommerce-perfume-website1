/**
 * Simple script to test the cron job functionality
 * Run with: node src/scripts/test-cron.js
 */

// Import required modules
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.NEXT_RUNTIME = 'nodejs';

console.log('Starting cron job test...');

// Function to simulate the cron job
async function testCron() {
  try {
    // Import the process-emails module
    const processEmailsPath = path.join(__dirname, '..', 'server', 'process-emails.ts');
    
    // Check if the file exists
    if (!fs.existsSync(processEmailsPath)) {
      console.error(`Error: File not found: ${processEmailsPath}`);
      return;
    }
    
    console.log(`Found process-emails.ts at: ${processEmailsPath}`);
    
    // Run the TypeScript file using ts-node
    console.log('Executing process-emails.ts with ts-node...');
    
    try {
      execSync(`npx ts-node ${processEmailsPath}`, { stdio: 'inherit' });
      console.log('Process completed successfully');
    } catch (error) {
      console.error('Error executing ts-node:', error);
    }
  } catch (error) {
    console.error('Error in testCron:', error);
  }
}

// Run the test
testCron(); 