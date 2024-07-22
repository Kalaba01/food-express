import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import './GoTop.css';

const GoTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  useEffect(() => {
    if (document.body.classList.contains('dark-mode')) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, []);

  return (
    <div className="go-top">
      {isVisible && 
        <div onClick={scrollToTop} className="go-top-button">
          <FaArrowUp />
        </div>
      }
    </div>
  );
};

export default GoTop;
