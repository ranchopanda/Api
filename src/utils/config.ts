// Configuration utility to ensure environment variables are always available
export const getApiBaseUrl = (): string => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://plant-saathi-api.onrender.com/api';
  
  // Ensure we always have a valid URL
  if (!apiBaseUrl || apiBaseUrl.trim() === '') {
    return 'https://plant-saathi-api.onrender.com/api';
  }
  
  return apiBaseUrl;
};

// Validate configuration on app startup
if (typeof window !== 'undefined') {
  console.log('API Base URL:', getApiBaseUrl());
} 