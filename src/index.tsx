import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import RouterApp from './RouterApp';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterApp />
  </React.StrictMode>
);
