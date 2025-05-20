// Archivo principal para iniciar la aplicación
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Renderizar la aplicación en el div root
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);