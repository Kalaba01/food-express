import React from 'react';
import { Header, AdminStatistic } from '../index';

function Admin({ darkMode, toggleDarkMode }) {
  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="administrator" />
      <h2>Admin Dashboard</h2>
      <AdminStatistic />
    </div>
  );
}

export default Admin;
