
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent page reload when switching tabs
if (typeof window !== 'undefined') {
  // Preserve form data across tab switches
  window.addEventListener('beforeunload', (event) => {
    // Only prevent unload if it's not a real navigation action
    if (document.visibilityState === 'hidden' || document.hasFocus() === false) {
      event.preventDefault();
      event.returnValue = '';
      return '';
    }
  });
  
  // Disable automatic reload on focus
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      // Page was restored from bfcache (back/forward navigation)
      event.preventDefault();
    }
  });
}

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root element not found!');
}
