import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getApiBaseUrl } from './utils/config';
import { setupErrorHandler } from './utils/errorHandler';

// Bulletproof configuration - NO environment variable dependency
if (typeof window !== 'undefined') {
  // Setup global error handler to prevent any configuration errors
  setupErrorHandler();
  
  console.log('API Base URL configured:', getApiBaseUrl());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
