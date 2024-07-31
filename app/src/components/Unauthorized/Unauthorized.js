import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcLock, FcUnlock } from "react-icons/fc";
import { Header } from "../index";
import { useTranslation } from 'react-i18next';
import "./Unauthorized.css";

const Unauthorized = () => {
  const { t } = useTranslation('global');
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleReturnHome = () => {
    navigate("/");
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleUnlockClick = () => {
    window.location.href =
      "mailto:foodexpressproject@outlook.com?subject=Unauthorized Access&body=I encountered a 403 Forbidden error on your website.";
  };

  return (
    <div className="unauthorized-page">
      <Header showIcons={false} />
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
