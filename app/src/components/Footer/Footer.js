import React from 'react';
import './Footer.css';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation('global');

  return (
    <footer className="footer">
      <p>{t('Footer.copyRightText')}</p>
    </footer>
  );
}

export default Footer;
