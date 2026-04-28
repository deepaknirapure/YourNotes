import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Global styles - design tokens aur shared classes
import './styles/global.css';
// Mobile-specific responsive fixes
import './styles/mobile.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
