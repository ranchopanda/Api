// Bulletproof configuration utility - NO environment variable dependency
export const getApiBaseUrl = (): string => {
  // Try to get from environment variable first
  const envUrl = import.meta.env?.VITE_API_BASE_URL;
  
  // If environment variable is set and not empty, use it
  if (envUrl && envUrl.trim() !== '') {
    return envUrl;
  }
  
  // Always return the Render backend URL as fallback - NO environment variable dependency
  return 'https://plant-saathi-api.onrender.com/api';
};

// Global configuration - NO environment variable checks
if (typeof window !== 'undefined') {
  console.log('API Base URL configured:', getApiBaseUrl());
} 