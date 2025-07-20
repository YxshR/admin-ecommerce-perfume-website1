export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      console.log('[Instrumentation] Loading server module...');
      // Import the server module which will self-initialize
      await import('./src/server');
      console.log('[Instrumentation] Server module loaded successfully');
    } catch (error) {
      console.error('[Instrumentation] Failed to load server module:', error);
    }
  }
} 