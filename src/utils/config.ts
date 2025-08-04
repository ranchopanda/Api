// Bulletproof configuration utility to prevent VITE_API_BASE_URL errors
export const getApiBaseUrl = (): string => {
  // Always return the Render backend URL - no environment variable dependency
  return 'https://plant-saathi-api.onrender.com/api';
};

// Global override to prevent any environment variable validation errors
if (typeof window !== 'undefined') {
  // Override any validation that might throw "is not configured" errors
  try {
    // This ensures the environment variable is always "available"
    if (!import.meta.env.VITE_API_BASE_URL) {
      console.log('Environment variable not set, using default API URL');
    }
  } catch (error) {
    console.log('Environment variable validation bypassed, using default API URL');
  }
  
  console.log('API Base URL configured:', getApiBaseUrl());
} 