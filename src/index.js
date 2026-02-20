import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Agar aapke paas index.css hai to yeh line rehne dein
import App from './components/App'; // YEH LINE ZAROORI HAI: App ab components folder ke andar hai

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
