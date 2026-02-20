import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app'; // app.js bahar hai isliye path ./app hai

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
