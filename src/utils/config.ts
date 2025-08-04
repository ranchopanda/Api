// Bulletproof configuration utility - NO environment variable dependency
export const getApiBaseUrl = (): string => {
  // Always return the Render backend URL - NO environment variable dependency
  return 'https://plant-saathi-api.onrender.com/api';
};

// Global configuration - NO environment variable checks
if (typeof window !== 'undefined') {
  console.log('API Base URL configured:', getApiBaseUrl());
} 