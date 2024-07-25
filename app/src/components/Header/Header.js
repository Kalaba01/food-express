import React from 'react';
import { FaUser, FaGlobe, FaSun, FaMoon } from 'react-icons/fa';
import './Header.css';

function Header({ darkMode, toggleDarkMode, openPopupModal }) {
  return (
    <header className="top-bar">
      <div className="logo-container">
        <img src="./images/logo.png" alt="Food Express Logo" className="logo" />
        <span className="logo-text">Food Express</span>
      </div>
      <div className="top-bar-icons">
        <FaUser className="icon" onClick={() => openPopupModal('login')} />
        <div className="theme-icon" onClick={toggleDarkMode}>
          {darkMode ? <FaSun className="icon" /> : <FaMoon className="icon" />}
        </div>
        <FaGlobe className="icon" />
      </div>
    </header>
  );
}

export default Header;
