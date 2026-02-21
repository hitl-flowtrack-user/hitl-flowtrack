import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app'; // 'app' lowercase matching your file name

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
