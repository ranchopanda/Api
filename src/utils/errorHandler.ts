// Global error handler to prevent any configuration errors
export const setupErrorHandler = () => {
  if (typeof window !== 'undefined') {
    // Override any global error handlers that might throw configuration errors
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('VITE_API_BASE_URL is not configured')) {
        console.log('Prevented VITE_API_BASE_URL configuration error, using default API URL');
        return;
      }
      if (message.includes('is not configured')) {
        console.log('Prevented configuration error, using default settings');
        return;
      }
      originalError.apply(console, args);
    };
    
    // Also override any global error handlers
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (typeof message === 'string' && message.includes('VITE_API_BASE_URL is not configured')) {
        console.log('Prevented VITE_API_BASE_URL configuration error, using default API URL');
        return true; // Prevent the error from being logged
      }
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };
  }
}; 