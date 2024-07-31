import React from 'react';
import { Header } from '../index';

function Owner({ darkMode, toggleDarkMode }) {
  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="owner" />
      <h2>Owner Dashboard</h2>
    </div>
  );
}

export default Owner;
