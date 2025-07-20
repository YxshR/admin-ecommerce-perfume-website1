import { initCronJobs, stopCronJobs } from './cron-service';

// Track initialization across module reloads
const GLOBAL_KEY = '__CRON_SERVER_INITIALIZED__';

/**
 * Initialize the server-side services
 */
export function initServer() {
  // Check if already initialized using a global flag
  // @ts-ignore - Using global as any to store our flag
  if (global[GLOBAL_KEY] === true) {
    console.log('Server already initialized, skipping');
    return;
  }
  
  console.log('Initializing server-side services...');
  
  try {
    // Initialize cron jobs
    initCronJobs();
    
    // Set up cleanup on process termination
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
    // Mark as initialized
    // @ts-ignore - Using global as any to store our flag
    global[GLOBAL_KEY] = true;
    
    console.log('Server initialization complete');
  } catch (error) {
    console.error('Failed to initialize server:', error);
    // Don't mark as initialized if it failed
  }
}

/**
 * Clean up resources when the server is shutting down
 */
function cleanup() {
  console.log('Server shutting down, cleaning up resources...');
  
  try {
    // Stop all cron jobs
    stopCronJobs();
    
    // Reset initialization flag
    // @ts-ignore - Using global as any to store our flag
    global[GLOBAL_KEY] = false;
    
    console.log('Cleanup complete');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
  
  // Only exit in production - in dev this would terminate the dev server
  if (process.env.NODE_ENV === 'production') {
    process.exit(0);
  }
}

// Force initialization immediately when this module is imported
// This ensures it runs in all Next.js environments
initServer(); 