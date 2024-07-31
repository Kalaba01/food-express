import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe } from 'react-icons/fa';
import './Language.css';

function Language() {
  const { i18n } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setShowDropdown(false);
  };

  return (
    <div className="language-selector">
      <FaGlobe className="icon" onClick={() => setShowDropdown(!showDropdown)} />
      {showDropdown && (
        <div className="dropdown">
          <div className="dropdown-item" onClick={() => changeLanguage('en')}>
            <img src="./images/usa.png" alt="English" />
          </div>
          <div className="dropdown-item" onClick={() => changeLanguage('bs')}>
            <img src="./images/bih.png" alt="Bosnian" />
          </div>
        </div>
      )}
    </div>
  );
}

export default Language;
