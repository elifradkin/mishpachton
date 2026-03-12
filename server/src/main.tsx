import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { setLocale } from './i18n';

// Initialize locale
setLocale('he');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
