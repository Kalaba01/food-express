import React, { useContext } from 'react';
import { LoginRegister, Theme, Language, Logout, HamburgerMenu, Chat, Basket, Status } from "../index";
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { BasketContext } from '../../BasketContext';
import { jwtDecode } from "jwt-decode";
import { FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ darkMode, toggleDarkMode, openPopupModal, userType, showIcons = true, hideHamburgerMenu = false }) {
  const { t } = useTranslation('global');
  const { basket, setBasket } = useContext(BasketContext);
  const token = localStorage.getItem('token');
  let isLoggedIn = false;
  let currentUser = null;
  const location = useLocation();

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

  const isBasketVisible = location.pathname.startsWith('/restaurants/');

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
              {currentUser.role === 'courier' && <Status id={currentUser.id} />}
              {currentUser.role === 'customer' && isBasketVisible && <Basket items={basket} />}
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
