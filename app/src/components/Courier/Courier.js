import React from 'react';
import { Header } from '../index';

function Courier({ darkMode, toggleDarkMode }) {
  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="courier" />
      <h2>Courier Dashboard</h2>
    </div>
  );
}

export default Courier;
