import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getApiBaseUrl } from './utils/config';
import { setupErrorHandler } from './utils/errorHandler';
import { setupGlobalOverride } from './utils/globalOverride';

// Nuclear option: Prevent ANY environment variable validation errors
if (typeof window !== 'undefined') {
  // Setup nuclear override to prevent ANY configuration errors
  setupGlobalOverride();
  
  // Setup global error handler as backup
  setupErrorHandler();
  
  console.log('Nuclear override applied - API Base URL configured:', getApiBaseUrl());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
