import React, { useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { FaUser, FaGlobe, FaSun, FaMoon } from 'react-icons/fa';
import PopupForm from './components/PopupForm/PopupForm';
import NotificationPopup from './components/NotificationPopup/NotificationPopup';
import Customer from './components/Customer/Customer';
import Owner from './components/Owner/Owner';
import Courier from './components/Courier/Courier';
import Admin from './components/Admin/Admin';
import GoTop from './components/GoTop/GoTop';
import './App.css';

function App() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [formType, setFormType] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const toggleFaq = (index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    if (faqOpen === index) {
      setFaqOpen(null);
      setTimeout(() => setIsAnimating(false), 300);
    } else {
      if (faqOpen !== null) {
        setTimeout(() => {
          setFaqOpen(index);
          setIsAnimating(false);
        }, 300);
      } else {
        setFaqOpen(index);
        setTimeout(() => setIsAnimating(false), 300);
      }
    }
  };

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
      <header className="top-bar">
        <div className="logo-container">
          <img src="./images/logo.png" alt="Food Express Logo" className="logo" />
          <span className="logo-text">Food Express</span>
        </div>
        <div className="top-bar-icons">
          <FaUser className="icon" onClick={() => openPopupModal('login')} />
          <div className="theme-icon" onClick={toggleDarkMode}>
            {darkMode ? <FaSun className="icon" /> : <FaMoon className="icon" />}
          </div>
          <FaGlobe className="icon" />
        </div>
      </header>

      {isPopupOpen && (
        <PopupForm
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
          <main>
            <section className="who-are-we">
              <h2>Who are we?</h2>
              <div className="content-row">
                <img src="https://placehold.co/600x600" alt="About Us" className="content-img" />
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.</p>
              </div>
            </section>

            <section className="cities">
              <h2>In which cities we operate?</h2>
              <div className="content-row normal">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.</p>
                <img src="https://placehold.co/600x600" alt="Cities" className="content-img" />
              </div>
            </section>

            <section className="partners">
              <h2>Our partners</h2>
              <div className="partner-logos">
                <img src="https://placehold.co/600x600" alt="Partner 1" className="partner-logo" />
                <img src="https://placehold.co/600x600" alt="Partner 2" className="partner-logo" />
                <img src="https://placehold.co/600x600" alt="Partner 3" className="partner-logo" />
                <img src="https://placehold.co/600x600" alt="Partner 4" className="partner-logo" />
              </div>
            </section>

            <section className="join-us">
              <h2>Become part of Food Express</h2>
              <div className="join-us-cards">
                <div className="join-card" onClick={() => openPopupModal('partner')}>
                  <img src="https://placehold.co/400x400" alt="Become a partner" className="join-img" />
                  <button>Become a partner</button>
                </div>
                <div className="join-card" onClick={() => openPopupModal('deliver')}>
                  <img src="https://placehold.co/400x400" alt="Deliver with us" className="join-img" />
                  <button>Deliver with us</button>
                </div>
                <div className="join-card" onClick={() => openPopupModal('join')}>
                  <img src="https://placehold.co/400x400" alt="Join the team" className="join-img" />
                  <button>Join the team</button>
                </div>
              </div>
            </section>

            <section className="faq">
              <h2>FAQ</h2>
              {[...Array(3)].map((_, index) => (
                <div key={index} className={`faq-item ${faqOpen === index ? 'active' : ''}`} onClick={() => toggleFaq(index)}>
                  <h3>Question {index + 1}</h3>
                  <div className={`faq-answer ${faqOpen === index ? 'open' : ''}`}>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.</p>
                  </div>
                </div>
              ))}
            </section>
          </main>
        } />
        <Route path="/customer" element={<Customer />} />
        <Route path="/owner" element={<Owner />} />
        <Route path="/courier" element={<Courier />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <GoTop />
      <footer>
        <p>© 2024 Food Express. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
