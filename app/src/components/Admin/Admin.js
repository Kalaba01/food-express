import React from 'react';
import { Header } from '../index';

function Admin({ darkMode, toggleDarkMode, openPopupModal }) {
  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} openPopupModal={openPopupModal} />
      <h2>Admin Dashboard</h2>
    </div>
  );
}

export default Admin;
