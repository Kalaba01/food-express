import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe } from 'react-icons/fa';
import './Language.css';

function Language() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetches stored language from localStorage and updates the app's language
  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage && storedLanguage !== i18n.language) {
      i18n.changeLanguage(storedLanguage);
      setLanguage(storedLanguage);
    }
  }, [i18n]);

  // Changes the app's language and updates both state and localStorage
  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    setLanguage(language);
    localStorage.setItem('language', language);
    setShowDropdown(false);
  };

  return (
    <div className="language-selector">
      <FaGlobe className="icon" onClick={() => setShowDropdown(!showDropdown)} />
      <div className={`dropdown ${showDropdown ? 'show' : ''}`}>
        <div className="dropdown-item" onClick={() => changeLanguage('en')}>
          <img src="/images/usa.png" alt="English" />
        </div>
        <div className="dropdown-item" onClick={() => changeLanguage('bs')}>
          <img src="/images/bih.png" alt="Bosnian" />
        </div>
      </div>
    </div>
  );
}

export default Language;
