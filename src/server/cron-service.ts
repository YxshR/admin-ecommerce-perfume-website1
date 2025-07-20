import cron from 'node-cron';
import { processScheduledEmails } from './process-emails';

// Store job information with last run time
interface CronJobInfo {
  job: cron.ScheduledTask;
  name: string;
  schedule: string;
  lastRun: Date | null;
  nextRun: Date | null;
  running: boolean;
  errorCount: number;
}

// Track all cron jobs
const cronJobs: Record<string, CronJobInfo> = {};

// Calculate next run time based on cron expression
function getNextRunTime(cronExpression: string): Date {
  const parts = cronExpression.split(' ');
  const now = new Date();
  
  // Simple calculation for */30 * * * * * (every 30 seconds)
  if (parts[0] === '*/30' && parts.length === 6) {
    const seconds = now.getSeconds();
    const nextSeconds = seconds < 30 ? 30 : 60;
    const nextRun = new Date(now);
    nextRun.setSeconds(nextSeconds);
    nextRun.setMilliseconds(0);
    return nextRun;
  }
  
  // For other schedules, just add 1 minute as an approximation
  return new Date(now.getTime() + 60000);
}

/**
 * Initialize all cron jobs
 */
export function initCronJobs() {
  console.log('[CRON SERVICE] Initializing cron jobs...');
  
  try {
    // Schedule email processing every 30 seconds
    const emailJobName = 'process-emails';
    const emailJobSchedule = '*/30 * * * * *';
    
    console.log(`[CRON SERVICE] Setting up job '${emailJobName}' with schedule: ${emailJobSchedule}`);
    
    const job = cron.schedule(emailJobSchedule, async () => {
      try {
        // Update last run time before processing
        if (cronJobs[emailJobName]) {
          cronJobs[emailJobName].lastRun = new Date();
        }
        
        console.log(`[CRON SERVICE] Running job '${emailJobName}' at ${new Date().toISOString()}`);
        await processScheduledEmails();
        
        // Update next run time and reset error count on success
        if (cronJobs[emailJobName]) {
          cronJobs[emailJobName].nextRun = getNextRunTime(emailJobSchedule);
          cronJobs[emailJobName].errorCount = 0;
        }
      } catch (error) {
        console.error(`[CRON SERVICE] Error in job '${emailJobName}':`, error);
        
        // Increment error count
        if (cronJobs[emailJobName]) {
          cronJobs[emailJobName].errorCount += 1;
        }
      }
    });
    
    // Start the job immediately
    job.start();
    
    // Store job information
    cronJobs[emailJobName] = {
      job,
      name: emailJobName,
      schedule: emailJobSchedule,
      lastRun: null,
      nextRun: getNextRunTime(emailJobSchedule),
      running: true,
      errorCount: 0
    };
    
    console.log(`[CRON SERVICE] Job '${emailJobName}' scheduled successfully`);
    console.log(`[CRON SERVICE] Next run at: ${cronJobs[emailJobName].nextRun?.toISOString()}`);
    
    // Run the job immediately on startup
    console.log(`[CRON SERVICE] Running initial job execution for '${emailJobName}'`);
    processScheduledEmails().catch((error: unknown) => {
      console.error(`[CRON SERVICE] Error in initial job execution:`, error);
    });
    
    console.log('[CRON SERVICE] All cron jobs initialized successfully');
  } catch (error) {
    console.error('[CRON SERVICE] Error initializing cron jobs:', error);
    throw error; // Re-throw to indicate initialization failure
  }
}

/**
 * Stop all running cron jobs
 */
export function stopCronJobs() {
  console.log('[CRON SERVICE] Stopping all cron jobs...');
  
  try {
    Object.entries(cronJobs).forEach(([name, jobInfo]) => {
      console.log(`[CRON SERVICE] Stopping job '${name}'`);
      jobInfo.job.stop();
      jobInfo.running = false;
    });
    
    console.log('[CRON SERVICE] All cron jobs stopped');
  } catch (error) {
    console.error('[CRON SERVICE] Error stopping cron jobs:', error);
    throw error;
  }
}

/**
 * Get the status of all cron jobs
 */
export function getCronJobsStatus() {
  return Object.values(cronJobs).map(jobInfo => ({
    name: jobInfo.name,
    schedule: jobInfo.schedule,
    running: jobInfo.running,
    lastRun: jobInfo.lastRun?.toISOString() || null,
    nextRun: jobInfo.nextRun?.toISOString() || null,
    errorCount: jobInfo.errorCount
  }));
}

// For development/debugging
if (process.env.NODE_ENV === 'development') {
  console.log('[CRON SERVICE] Development mode: Cron service loaded');
} 