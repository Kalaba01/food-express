import React, { useState } from 'react';
import { FaUser, FaGlobe, FaSun, FaMoon } from 'react-icons/fa';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPopup from './components/Auth/LoginPopup';
import RegisterPopup from './components/Auth/RegisterPopup';
import RequestPopup from './components/RequestPopup/RequestPopup';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [formType, setFormType] = useState('');

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

  const openLoginModal = () => {
    setIsLoginOpen(true);
    setIsRegisterOpen(false);
    setIsRequestOpen(false);
  };

  const closeLoginModal = () => {
    setIsLoginOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterOpen(true);
    setIsLoginOpen(false);
    setIsRequestOpen(false);
  };

  const closeRegisterModal = () => {
    setIsRegisterOpen(false);
  };

  const openRequestModal = (type) => {
    setIsRequestOpen(true);
    setFormType(type);
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
  };

  const closeRequestModal = () => {
    setIsRequestOpen(false);
  };

  return (
    <Router>
      <div className={`App ${darkMode ? 'dark' : ''}`}>
        <header className="top-bar">
          <div className="logo-container">
            <img src="./images/logo.png" alt="Food Express Logo" className="logo" />
            <span className="logo-text">Food Express</span>
          </div>
          <div className="top-bar-icons">
            <FaUser className="icon" onClick={openLoginModal} />
            <div className="theme-icon" onClick={toggleDarkMode}>
              {darkMode ? <FaSun className="icon" /> : <FaMoon className="icon" />}
            </div>
            <FaGlobe className="icon" />
          </div>
        </header>

        {isLoginOpen && <LoginPopup closeLoginModal={closeLoginModal} switchToRegister={openRegisterModal} />}
        {isRegisterOpen && <RegisterPopup closeRegisterModal={closeRegisterModal} switchToLogin={openLoginModal} />}
        {isRequestOpen && <RequestPopup closeModal={closeRequestModal} formType={formType} />}

        <main>
          <Routes>
            <Route path="/" element={
              <>
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
                    <div className="join-card" onClick={() => openRequestModal('partner')}>
                      <img src="https://placehold.co/400x400" alt="Become a partner" className="join-img" />
                      <button>Become a partner</button>
                    </div>
                    <div className="join-card" onClick={() => openRequestModal('deliver')}>
                      <img src="https://placehold.co/400x400" alt="Deliver with us" className="join-img" />
                      <button>Deliver with us</button>
                    </div>
                    <div className="join-card" onClick={() => openRequestModal('join')}>
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
              </>
            } />
            <Route path="/customer" element={<div><h2>Customer Dashboard</h2><p>Welcome to the customer dashboard!</p></div>} />
            <Route path="/owner" element={<div><h2>Owner Dashboard</h2><p>Welcome to the owner dashboard!</p></div>} />
            <Route path="/courier" element={<div><h2>Courier Dashboard</h2><p>Welcome to the courier dashboard!</p></div>} />
            <Route path="/admin" element={<div><h2>Admin Dashboard</h2><p>Welcome to the admin dashboard!</p></div>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer>
          <p>© 2024 Food Express. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
