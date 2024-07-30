import React from 'react';
import { Header } from '../index';

function Customer({ darkMode, toggleDarkMode, openPopupModal }) {
  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} openPopupModal={openPopupModal} />
      <h2>Customer Dashboard</h2>
    </div>
  );
}

export default Customer;
