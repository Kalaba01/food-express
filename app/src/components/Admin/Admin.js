import React from 'react';
import { Header, Footer } from '../index';

function Admin({ darkMode, toggleDarkMode }) {
  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="administrator" />
      <h2>Admin Dashboard</h2>
      
    </div>
  );
}

export default Admin;
