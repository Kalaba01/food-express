import React from 'react';
import { Header } from '../index';

function Customer({ darkMode, toggleDarkMode }) {
  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="customer" />
      <h2>Customer Dashboard</h2>
    </div>
  );
}

export default Customer;
