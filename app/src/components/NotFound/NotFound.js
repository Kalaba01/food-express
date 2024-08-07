import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../index';
import { useTranslation } from 'react-i18next';
import './NotFound.css';

const NotFound = ({ darkMode, toggleDarkMode }) => {
  const { t } = useTranslation('global');
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate("/");
  };

  return (
    <div className="not-found-page">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} showIcons={false} hideHamburgerMenu={true} />
      <div className="not-found-container">
        <h1 className="not-found-title">404</h1>
        <p className="not-found-text">{t('NotFound.pageNotFound')}</p>
        <button className="return-home-button" onClick={handleReturnHome}>
          {t('NotFound.returnHome')}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
