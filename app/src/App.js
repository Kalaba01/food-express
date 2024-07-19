import React, { useState } from 'react';
import { FaUser, FaGlobe, FaSun, FaMoon } from 'react-icons/fa';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

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

  return (
    <div className={`App ${darkMode ? 'dark' : ''}`}>
      <header className="top-bar">
        <div className="logo-container">
          <img src="logo.png" alt="Food Express Logo" className="logo" />
          <span className="logo-text">Food Express</span>
        </div>
        <div className="top-bar-icons">
          <FaUser className="icon" />
          <div className="theme-icon" onClick={toggleDarkMode}>
            {darkMode ? <FaSun className="icon" /> : <FaMoon className="icon" />}
          </div>
          <FaGlobe className="icon" />
        </div>
      </header>

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
              <img src="https://placehold.co/400x400" alt="Join as a Driver" className="join-img" />
              <button>Join as a Driver</button>
            </div>
            <div className="join-card">
              <img src="https://placehold.co/400x400" alt="Join as a Restaurant" className="join-img" />
              <button>Join as a Restaurant</button>
            </div>
            <div className="join-card">
              <img src="https://placehold.co/400x400" alt="Join as a Partner" className="join-img" />
              <button>Join as a Partner</button>
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

      <footer>
        <p>© 2024 Food Express. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
