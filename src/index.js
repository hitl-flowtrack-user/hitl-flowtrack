import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app'; // 'A' ko 'a' kar diya hai taake file mil jaye

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
