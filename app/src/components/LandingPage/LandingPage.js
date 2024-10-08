import React, { useState, useEffect } from 'react';
import { Header, TopRestaurants } from '../index';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode';
import './LandingPage.css';

function LandingPage({ openPopupModal, darkMode, toggleDarkMode }) {
  const { t } = useTranslation('global');
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
          <h2>{t('LandingPage.whoAreWe.header')}</h2>
          <div className="content-row">
            <img src="/images/who_are_we.jpg" alt="About Us" className="content-img" />
            <p>{t('LandingPage.whoAreWe.content')}</p>
          </div>
        </section>

        <section className="cities">
          <h2>{t('LandingPage.cities.header')}</h2>
          <div className="content-row normal">
            <p>{t('LandingPage.cities.content')}</p>
            <img src="/images/cities.png" alt="Cities" className="content-img" />
          </div>
        </section>

        <TopRestaurants openPopupModal={openPopupModal} />

        <section className="join-us">
          <h2>{t('LandingPage.joinUs.header')}</h2>
          <div className="join-us-cards">
            <div className="join-card">
              <img src="/images/become_partner.jpg" alt="Become a partner" className="join-img" />
              <button onClick={() => openPopupModal('partner')}>{t('LandingPage.joinUs.becomePartnerButton')}</button>
            </div>
            <div className="join-card">
              <img src="/images/deliver_with_us.jpg" alt="Deliver with us" className="join-img" />
              <button onClick={() => openPopupModal('deliver')}>{t('LandingPage.joinUs.deliverWithUsButton')}</button>
            </div>
            <div className="join-card">
              <img src="/images/join_team.jpg" alt="Join the team" className="join-img" />
              <button onClick={() => openPopupModal('join')}>{t('LandingPage.joinUs.joinTeamButton')}</button>
            </div>
          </div>
        </section>

        <section className="faq">
          <h2>{t('LandingPage.faq.header')}</h2>
          {[...Array(4)].map((_, index) => (
            <div key={index} className={`faq-item ${faqOpen === index ? 'active' : ''}`} onClick={() => toggleFaq(index)}>
              <h3>{t(`LandingPage.faq.question${index + 1}`)}</h3>
              <div className={`faq-answer ${faqOpen === index ? 'open' : ''}`}>
                <p>{t(`LandingPage.faq.answer${index+1}`)}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
