// Configuration utility to ensure environment variables are always available
export const getApiBaseUrl = (): string => {
  // Always return the Render backend URL as the primary choice
  return 'https://plant-saathi-api.onrender.com/api';
};

// Global configuration to prevent environment variable errors
if (typeof window !== 'undefined') {
  // Ensure the environment variable is always available
  if (!import.meta.env.VITE_API_BASE_URL) {
    // This prevents the "is not configured" error
    console.log('Using default API base URL');
  }
  console.log('API Base URL:', getApiBaseUrl());
} 