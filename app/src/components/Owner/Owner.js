import React from 'react';
import { Header } from '../index';

function Owner({ darkMode, toggleDarkMode, openPopupModal }) {
  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} openPopupModal={openPopupModal} />
      <h2>Owner Dashboard</h2>
    </div>
  );
}

export default Owner;
