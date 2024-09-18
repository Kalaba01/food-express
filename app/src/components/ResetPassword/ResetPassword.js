import React, { useState } from 'react';
import { Header, NotificationPopup } from '../index';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './ResetPassword.css';

function ResetPassword({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation('global');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  // Function to handle the password reset form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = new URLSearchParams(window.location.search).get('token');

    if (newPassword !== confirmPassword) {
      setNotification({ message: t('ResetPassword.passwordMismatch'), type: 'error' });
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8000/reset-password`, null, {
        params: {
          token: token,
          new_password: newPassword
        }
      });

      if (response.data.message === "Password reset successful") {
        setNotification({ message: t('ResetPassword.successMessage'), type: 'success' });
        setTimeout(() => navigate('/'), 3000);
      }
    } catch (error) {
      if (error.response && error.response.data.detail === "New password cannot be the same as the current password") {
        setNotification({ message: t('ResetPassword.samePasswordError'), type: 'error' });
      } else {
        setNotification({ message: t('ResetPassword.errorMessage'), type: 'error' });
      }
    }
  };

  return (
    <>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="forgot" />
      <div className="reset-password-container">
        <h2>{t('ResetPassword.title')}</h2>
        <form onSubmit={handleSubmit}>
          <label>{t('ResetPassword.newPasswordLabel')}</label>
          <input 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
          />
          <label>{t('ResetPassword.confirmPasswordLabel')}</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
          <button type="submit">{t('ResetPassword.submitButton')}</button>
        </form>
      </div>
      {notification.message && <NotificationPopup message={notification.message} type={notification.type} />}
    </>
  );
}

export default ResetPassword;
