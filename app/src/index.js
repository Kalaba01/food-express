import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';

import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Import the i18n configuration

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <I18nextProvider i18n={i18n}>
    <Router>
      <App />
    </Router>
  </I18nextProvider>
);
