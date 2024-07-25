import React from 'react';
import './Header.css';
import LoginRegister from '../LoginRegister/LoginRegister';
import Theme from '../Theme/Theme';
import Language from '../Language/Language';

function Header({ darkMode, toggleDarkMode, openPopupModal }) {
  return (
    <header className="top-bar">
      <div className="logo-container">
        <img src="./images/logo.png" alt="Food Express Logo" className="logo" />
        <span className="logo-text">Food Express</span>
      </div>
      <div className="top-bar-icons">
        <LoginRegister openPopupModal={openPopupModal} />
        <Theme darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Language />
      </div>
    </header>
  );
}

export default Header;
