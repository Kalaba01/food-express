import React from 'react';
import { LoginRegister, Theme, Language, Logout, HamburgerMenu, Chat, Basket } from "../index";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from 'react-i18next';
import { FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ darkMode, toggleDarkMode, openPopupModal, userType, showIcons = true, hideHamburgerMenu = false }) {
  const { t } = useTranslation('global');
  const token = localStorage.getItem('token');
  let isLoggedIn = false;
  let currentUser = null;

  if (token) {
    try {
      currentUser = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (currentUser.exp > currentTime) {
        isLoggedIn = true;
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error("Invalid token", error);
      localStorage.removeItem('token');
    }
  }

  return (
    <header className="top-bar">
      {isLoggedIn && !hideHamburgerMenu && <HamburgerMenu />}
      <div className={`logo-container ${!isLoggedIn ? 'login' : 'notlogin'}`}>
        <Link to="/" className="logo-link">
          <img src="/images/logo.png" alt="Food Express Logo" className="logo" />
        </Link>
        <span className="logo-text">{t('Header.logoText')}</span>
      </div>
      <div className="top-bar-icons">
        {showIcons ? (
          isLoggedIn ? (
            <>
              <Link to="/profile" className="profile-icon">
                <FaUser size={24} />
              </Link>
              {currentUser.role === 'customer' && <Basket />}
              <Chat userType={currentUser} />
              <Theme darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              <Language className="language-icon" />
              {userType !== "forgot" && <Logout />}
            </>
          ) : (
            <>
              {userType === "guest" && <LoginRegister openPopupModal={openPopupModal} />}
              <Theme darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              <Language className="language-icon" />
            </>
          )
        ) : (
          <>
            <Theme darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <Language className="language-icon" />
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
