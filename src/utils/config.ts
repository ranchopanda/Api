// Configuration utility to ensure environment variables are always available
export const getApiBaseUrl = (): string => {
  // Always return the Render backend URL as the primary choice
  return 'https://plant-saathi-api.onrender.com/api';
};

// Validate configuration on app startup
if (typeof window !== 'undefined') {
  console.log('API Base URL:', getApiBaseUrl());
} 