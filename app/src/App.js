import React, { useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { FormPopup, NotificationPopup, Customer, Owner, Courier, Admin, LandingPage, Unauthorized } from './components/index';
import { jwtDecode } from 'jwt-decode';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [formType, setFormType] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  const openPopupModal = (type) => {
    setIsPopupOpen(true);
    setFormType(type);
  };

  const closePopupModal = () => {
    setIsPopupOpen(false);
  };

  const switchToOtherForm = (type) => {
    setFormType(type);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleLogin = (userRole, token) => {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp > currentTime) {
        localStorage.setItem('token', token);
        
        if (userRole === 'customer') {
          navigate('/customer');
        } else if (userRole === 'owner') {
          navigate('/owner');
        } else if (userRole === 'courier') {
          navigate('/courier');
        } else if (userRole === 'administrator') {
          navigate('/admin');
        }
      } else {
        showNotification('Session expired. Please log in again.', 'error');
      }
    } catch (error) {
      console.error("Invalid token", error);
      showNotification('Invalid session. Please log in again.', 'error');
    }
  };

  return (
    <div className={`App ${darkMode ? 'dark' : ''}`}>
      {isPopupOpen && (
        <FormPopup
          type={formType}
          closeModal={closePopupModal}
          switchToOtherForm={switchToOtherForm}
          showNotification={showNotification}
          handleLogin={handleLogin}
        />
      )}
      {notification.message && <NotificationPopup message={notification.message} type={notification.type} />}

      <Routes>
        <Route path="/" element={
          <LandingPage 
            openPopupModal={openPopupModal}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        } />
        <Route path="/customer" element={<ProtectedRoute allowedRoles={['customer']}><Customer /></ProtectedRoute>} />
        <Route path="/owner" element={<ProtectedRoute allowedRoles={['owner']}><Owner /></ProtectedRoute>} />
        <Route path="/courier" element={<ProtectedRoute allowedRoles={['courier']}><Courier /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['administrator']}><Admin /></ProtectedRoute>} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </div>
  );
}

export default App;
