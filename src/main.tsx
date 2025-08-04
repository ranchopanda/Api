import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getApiBaseUrl } from './utils/config';

// Global configuration to prevent environment variable errors
if (typeof window !== 'undefined') {
  // Ensure the environment variable is always available to prevent "is not configured" errors
  if (!import.meta.env.VITE_API_BASE_URL) {
    console.log('VITE_API_BASE_URL not set, using default');
  }
  console.log('API Base URL configured:', getApiBaseUrl());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
