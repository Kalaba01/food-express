import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { FormPopup, NotificationPopup, Customer, Owner, Courier, Admin, LandingPage, Unauthorized, ForgotPassword, ResetPassword, Requests, Users, NotFound, Footer, GoTop, DeliveryZones, Restaurants, Orders, Restaurant, CustomerRestaurant, Couriers, Profile, PendingOrders } from './components/index';
import { BasketProvider } from './BasketContext';
import { jwtDecode } from 'jwt-decode';
import ProtectedRoute from './components/ProtectedRoute';
import i18n from './i18n';
import './App.css';

function App() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [formType, setFormType] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [userRole, setUserRole] = useState(null);

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
        setUserRole(userRole);

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp > currentTime) {
          setUserRole(decodedToken.role);
        } else {
          localStorage.removeItem('token');
          navigate('/');
        }
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem('token');
        navigate('/');
      }
    }
  }, [navigate]);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
  }, []);

  return (
    <BasketProvider>
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

        <div className="main-content">
          <Routes>
            <Route path="/" element={
              <LandingPage 
                openPopupModal={openPopupModal}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            } />
            <Route path="/forgot" element={<ForgotPassword darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/reset-password" element={<ResetPassword darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['customer', 'owner', 'courier', 'administrator']}><Profile darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
            <Route path="/customer" element={<ProtectedRoute allowedRoles={['customer']}><Customer darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
            <Route path="/owner" element={<ProtectedRoute allowedRoles={['owner']}><Owner darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
            <Route path="/restaurants/:restaurantName" element={<ProtectedRoute allowedRoles={["customer"]}> <CustomerRestaurant darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
            <Route path="/owner/restaurant/:id" element={<ProtectedRoute allowedRoles={['owner']}><Restaurant darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
            <Route path="/owner/orders" element={<ProtectedRoute allowedRoles={['owner']}><PendingOrders darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
            <Route path="/courier" element={<ProtectedRoute allowedRoles={['courier']}><Courier darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['administrator']}><Admin darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
            <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={['administrator']}><Requests darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['administrator']}><Users darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
            <Route path="/admin/delivery-zones" element={<ProtectedRoute allowedRoles={['administrator']}><DeliveryZones darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
            <Route path="/admin/restaurants" element={<ProtectedRoute allowedRoles={['administrator']}><Restaurants darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['administrator']}><Orders darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
            <Route path="/admin/couriers" element={<ProtectedRoute allowedRoles={['administrator']}><Couriers darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
            <Route path="/unauthorized" element={<Unauthorized darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="*" element={<NotFound darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          </Routes>
        </div>

        <GoTop />
        <Footer />
      </div>
    </BasketProvider>
  );
}

export default App;
