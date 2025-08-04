import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure environment variables are always available
if (typeof window !== 'undefined') {
  // Set default values for environment variables
  if (!import.meta.env.VITE_API_BASE_URL) {
    console.log('Setting default VITE_API_BASE_URL');
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
