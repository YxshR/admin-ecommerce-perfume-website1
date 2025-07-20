/**
 * Standalone version of the process-emails module
 * Can be executed directly with: npx ts-node src/server/process-emails-standalone.ts
 */

import { processScheduledEmails } from './process-emails';

async function main() {
  console.log('Starting standalone email processing...');
  
  try {
    const result = await processScheduledEmails();
    console.log('Processing completed with result:', result);
  } catch (error) {
    console.error('Error processing emails:', error);
    process.exit(1);
  }
  
  console.log('Standalone processing completed');
}

// Execute if this file is run directly
if (require.main === module) {
  main().catch(console.error);
} 