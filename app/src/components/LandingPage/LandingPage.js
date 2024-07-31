import React, { useState, useEffect } from 'react';
import { Footer, Header } from '../index';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './LandingPage.css';

function LandingPage({ openPopupModal, darkMode, toggleDarkMode }) {
  const [faqOpen, setFaqOpen] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime) {
          if (decodedToken.role === 'customer') {
            navigate('/customer');
          } else if (decodedToken.role === 'owner') {
            navigate('/owner');
          } else if (decodedToken.role === 'courier') {
            navigate('/courier');
          } else if (decodedToken.role === 'administrator') {
            navigate('/admin');
          }
        }
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, [navigate]);

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

  return (
    <div>
      <Header openPopupModal={openPopupModal} darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="guest" />
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
            <div className="join-card">
              <img src="https://placehold.co/400x400" alt="Become a partner" className="join-img" />
              <button>Become a partner</button>
            </div>
            <div className="join-card">
              <img src="https://placehold.co/400x400" alt="Deliver with us" className="join-img" />
              <button>Deliver with us</button>
            </div>
            <div className="join-card">
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
      <Footer />
    </div>
  );
}

export default LandingPage;
