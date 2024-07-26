import React, { useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { FormPopup, NotificationPopup, Customer, Owner, Courier, Admin, LandingPage } from './components/index';
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

  const handleLogin = (userRole) => {
    if (userRole === 'customer') {
      navigate('/customer');
    } else if (userRole === 'owner') {
      navigate('/owner');
    } else if (userRole === 'courier') {
      navigate('/courier');
    } else if (userRole === 'administrator') {
      navigate('/admin');
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
        <Route path="/customer" element={<Customer />} />
        <Route path="/owner" element={<Owner />} />
        <Route path="/courier" element={<Courier />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
