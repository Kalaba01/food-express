import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loading } from "../index";
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import './TopRestaurants.css';

function TopRestaurants({ openPopupModal }) {
  const { t } = useTranslation('global');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetches the top restaurants
  useEffect(() => {
    const fetchTopRestaurants = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/top-restaurants');
        setRestaurants(response.data);
        setLoading(false);
      } catch (error) {
        console.error(t('TopRestaurants.fetchError'), error);
        setLoading(false);
      }
    };

    fetchTopRestaurants();
  }, [t]);

  // Handles the click on order button
  const handleOrderClick = (restaurantName) => {
    const token = localStorage.getItem('token');

    if (!token) {
      openPopupModal('login');
    } else {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime) {
          navigate(`/restaurants/${encodeURIComponent(restaurantName)}`);
        } else {
          openPopupModal('login');
        }
      } catch (error) {
        console.error(t('TopRestaurants.invalidTokenError'), error);
        openPopupModal('login');
      }
    }
  };

  // Scrolls the restaurant cards container to the left
  const scrollLeft = () => {
    const container = document.querySelector('.restaurant-cards-container');
    container.scrollLeft -= 305;
  };

  // Scrolls the restaurant cards container to the right
  const scrollRight = () => {
    const container = document.querySelector('.restaurant-cards-container');
    container.scrollLeft += 305;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="top-restaurants">
      <h2>{t('TopRestaurants.title')}</h2>
      <div className="scroll-buttons">
        <button className="scroll-btn" onClick={scrollLeft}>&lt;</button>
        <div className="restaurant-cards-container">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="restaurant-card">
              <h3>{restaurant.name}</h3>
              <img src={restaurant.image} alt={restaurant.name} />
              <button className="order-btn" onClick={() => handleOrderClick(restaurant.name)}>
                {t('TopRestaurants.order')}
              </button>
            </div>
          ))}
        </div>
        <button className="scroll-btn" onClick={scrollRight}>&gt;</button>
      </div>
    </div>
  );
}

export default TopRestaurants;
