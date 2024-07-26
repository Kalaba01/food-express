import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

function Theme({ darkMode, toggleDarkMode }) {
  return (
    <div className="theme-icon" onClick={toggleDarkMode}>
      {darkMode ? <FaSun className="icon" /> : <FaMoon className="icon" />}
    </div>
  );
}

export default Theme;
