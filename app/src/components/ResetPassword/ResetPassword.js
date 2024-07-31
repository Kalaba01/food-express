import React, { useState } from 'react';
import axios from 'axios';
import './ResetPassword.css';
import { useNavigate } from 'react-router-dom';
import { Header, NotificationPopup } from '../index';

function ResetPassword({ darkMode, toggleDarkMode }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = new URLSearchParams(window.location.search).get('token');

    if (newPassword !== confirmPassword) {
      setNotification({ message: 'Passwords do not match.', type: 'error' });
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
        setNotification({ message: 'Password reset successful.', type: 'success' });
        setTimeout(() => navigate('/'), 3000); // Preusmeri nakon 3 sekunde
      }
    } catch (error) {
      if (error.response && error.response.data.detail === "New password cannot be the same as the current password") {
        setNotification({ message: 'New password cannot be the same as the current password.', type: 'error' });
      } else {
        setNotification({ message: 'Error resetting password.', type: 'error' });
      }
    }
  };

  return (
    <>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="forgot" />
      <div className="reset-password-container">
        <h2>Reset Your Password</h2>
        <form onSubmit={handleSubmit}>
          <label>New Password:</label>
          <input 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
          />
          <label>Confirm Password:</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
          <button type="submit">Submit</button>
        </form>
      </div>
      {notification.message && <NotificationPopup message={notification.message} type={notification.type} />}
    </>
  );
}

export default ResetPassword;
