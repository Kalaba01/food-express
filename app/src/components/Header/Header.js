import React from 'react';
import { LoginRegister, Theme, Language, Logout } from "../index";
import { jwtDecode } from "jwt-decode";
import './Header.css';

function Header({ darkMode, toggleDarkMode, openPopupModal, userType }) {
  const token = localStorage.getItem('token');
  let isLoggedIn = false;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp > currentTime) {
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
      <div className="logo-container">
        <img src="./images/logo.png" alt="Food Express Logo" className="logo" />
        <span className="logo-text">Food Express</span>
      </div>
      <div className="top-bar-icons">
        {isLoggedIn ? (
          <>
            <Theme darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <Language />
            {userType !== "forgot" && <Logout />}
          </>
        ) : (
          <>
            {userType === "guest" && <LoginRegister openPopupModal={openPopupModal} />}
            <Theme darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <Language />
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
