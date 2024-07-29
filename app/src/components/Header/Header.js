import React from 'react';
import { LoginRegister, Theme, Language } from "../index";
import './Header.css';

function Header({ darkMode, toggleDarkMode, openPopupModal, showIcons = true }) {
  return (
    <header className="top-bar">
      <div className="logo-container">
        <img src="./images/logo.png" alt="Food Express Logo" className="logo" />
        <span className="logo-text">Food Express</span>
      </div>
      {showIcons && (
        <div className="top-bar-icons">
          <LoginRegister openPopupModal={openPopupModal} />
          <Theme darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <Language />
        </div>
      )}
    </header>
  );
}

export default Header;
