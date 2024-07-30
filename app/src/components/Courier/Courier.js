import React from 'react';
import { Header } from '../index';

function Courier({ darkMode, toggleDarkMode, openPopupModal }) {
  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} openPopupModal={openPopupModal} />
      <h2>Courier Dashboard</h2>
    </div>
  );
}

export default Courier;
