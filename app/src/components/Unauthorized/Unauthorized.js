import React, { useState } from "react";
import { FcLock, FcUnlock } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { Header } from "../index";
import { useTranslation } from 'react-i18next';
import "./Unauthorized.css";

const Unauthorized = ({ darkMode, toggleDarkMode }) => {
  const { t } = useTranslation('global');
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Navigates the user back to the home page
  const handleReturnHome = () => {
    navigate("/");
  };

  // Sets the hover state to true when the mouse enters the icon
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Sets the hover state to false when the mouse leaves the icon
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Redirects the user to send an email for unauthorized access
  const handleUnlockClick = () => {
    window.location.href =
      "mailto:foodexpressproject@outlook.com?subject=Unauthorized Access&body=I encountered a 403 Forbidden error on your website.";
  };

  return (
    <div className="unauthorized-page">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} showIcons={false} hideHamburgerMenu={true} />
      <div className="unauthorized-container">
        <h1 className="unauthorized-title">403</h1>
        <div className="unauthorized-lock-icon">
          {isHovered ? (
            <FcUnlock className="icon" size={80} color="#FF6347" onMouseLeave={handleMouseLeave} onClick={handleUnlockClick} />
          ) : (
            <FcLock className="icon" size={80} color="#FF6347" onMouseEnter={handleMouseEnter} />
          )}
        </div>
        <p className="unauthorized-text">{t('Unauthorized.accessForbidden')}</p>
        <button className="return-home-button" onClick={handleReturnHome}>
          {t('Unauthorized.returnHome')}
        </button>
      </div>
      
    </div>
  );
};

export default Unauthorized;
