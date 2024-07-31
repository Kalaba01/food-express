import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, NotificationPopup } from '../index';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ForgotPassword.css';

function ForgotPassword({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation('global');
  const [email, setEmail] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (notification.type === 'success') {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/forgot-password', { email });
      setNotification({ message: t('ForgotPassword.successMessage'), type: 'success' });
    } catch (error) {
      console.error("Error sending reset link:", error);
      setNotification({ message: t('ForgotPassword.errorMessage'), type: 'error' });
    }
  };

  return (
    <>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="forgot" />
      <div className="forgot-password-container">
        <h2>{t('ForgotPassword.title')}</h2>
        <form onSubmit={handleSubmit}>
          <label>{t('ForgotPassword.emailLabel')}</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <button type="submit">{t('ForgotPassword.submitButton')}</button>
        </form>
      </div>
      {notification.message && <NotificationPopup message={notification.message} type={notification.type} />}
    </>
  );
}

export default ForgotPassword;
