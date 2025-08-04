// BULLETPROOF configuration utility - NO environment variable dependency
export const getApiBaseUrl = (): string => {
  // ALWAYS return the Render backend URL - NO environment variable dependency
  // This ensures the frontend always works regardless of deployment domain
  return 'https://plant-saathi-api.onrender.com/api';
};

// Global configuration - NO environment variable checks
if (typeof window !== 'undefined') {
  console.log('🌱 Plant Saathi AI - API Base URL configured:', getApiBaseUrl());
  console.log('🌱 Frontend URL:', window.location.origin);
} 