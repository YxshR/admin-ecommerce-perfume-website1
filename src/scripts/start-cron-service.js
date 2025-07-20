/**
 * Script to manually start the cron service
 * Run with: node src/scripts/start-cron-service.js
 */

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.NEXT_RUNTIME = 'nodejs';
process.env.ENABLE_CRON_IN_DEV = 'true';

console.log('Starting cron service manually...');

// Register exit handlers
process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down...');
  process.exit(0);
});

// Import the server module which will initialize the cron service
require('ts-node/register');
require('../server/index');

console.log('Cron service started. Press Ctrl+C to stop.');

// Keep the process running
setInterval(() => {
  // Do nothing, just keep the process alive
}, 1000); 