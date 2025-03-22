import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

// Log available environment variables for debugging
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_TOOL_BASE_URL: process.env.REACT_APP_TOOL_BASE_URL,
  PUBLIC_URL: process.env.PUBLIC_URL,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// Actually send web vitals to console for performance monitoring
reportWebVitals(console.log); 