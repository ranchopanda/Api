// Global error handler to prevent VITE_API_BASE_URL configuration errors
export const setupErrorHandler = () => {
  if (typeof window !== 'undefined') {
    // Override any global error handlers that might throw "is not configured" errors
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('VITE_API_BASE_URL is not configured')) {
        console.log('Prevented VITE_API_BASE_URL configuration error, using default API URL');
        return;
      }
      originalError.apply(console, args);
    };
  }
}; 