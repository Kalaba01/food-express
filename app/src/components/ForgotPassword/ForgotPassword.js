import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, NotificationPopup } from '../index';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword({ darkMode, toggleDarkMode }) {
  const [email, setEmail] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (notification.type === 'success') {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000); // Preusmeri nakon 3 sekunde

      return () => clearTimeout(timer);
    }
  }, [notification, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/forgot-password', { email });
      setNotification({ message: 'If the email exists, a reset link has been sent.', type: 'success' });
    } catch (error) {
      console.error("Error sending reset link:", error);
      setNotification({ message: 'Error sending reset link.', type: 'error' });
    }
  };

  return (
    <>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="forgot" />
      <div className="forgot-password-container">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <button type="submit">Reset Password</button>
        </form>
      </div>
      {notification.message && <NotificationPopup message={notification.message} type={notification.type} />}
    </>
  );
}

export default ForgotPassword;
