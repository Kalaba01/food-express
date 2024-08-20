import React, { useState, useEffect } from "react";
import { Header, Gallery, GalleryPopup } from "../index";
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { useParams } from "react-router-dom";
import axios from "axios";
import "./CustomerRestaurant.css";

function CustomerRestaurant({ darkMode, toggleDarkMode }) {
  const { restaurantName } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [basket, setBasket] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentItemImages, setCurrentItemImages] = useState([]);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/restaurants/${encodeURIComponent(restaurantName)}/details`
        );
        setRestaurant(response.data);
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
      }
    };

    const fetchRestaurantMenu = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/restaurants/${encodeURIComponent(restaurantName)}/menu`
        );
        setMenu(response.data);
      } catch (error) {
        console.error("Error fetching restaurant menu:", error);
      }
    };

    fetchRestaurantDetails();
    fetchRestaurantMenu();
  }, [restaurantName]);

  const setItemQuantity = (itemId, quantity) => {
    setMenu((prevState) =>
      prevState.map((category) => ({
        ...category,
        items: category.items.map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(Number(quantity), 1) } : item
        ),
      }))
    );
  };

  const incrementQuantity = (itemId) => {
    setMenu((prevState) =>
      prevState.map((category) => ({
        ...category,
        items: category.items.map((item) =>
          item.id === itemId ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        ),
      }))
    );
  };

  const decrementQuantity = (itemId) => {
    setMenu((prevState) =>
      prevState.map((category) => ({
        ...category,
        items: category.items.map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max((item.quantity || 1) - 1, 1) } : item
        ),
      }))
    );
  };

  const addToBasket = (item) => {
    setBasket((prevState) => {
      const existingItem = prevState.find((i) => i.id === item.id);
      if (existingItem) {
        return prevState.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        return [...prevState, { ...item, quantity: item.quantity || 1 }];
      }
    });
  };

  const openGalleryPopup = (images) => {
    setCurrentItemImages(images.map(img => img.image));
    setIsPopupOpen(true);
  };

  const closeGalleryPopup = () => {
    setIsPopupOpen(false);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;

    return (
      <div className="star-rating">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={i} className="star" />
        ))}
        {halfStar && <FaStarHalfAlt className="star" />}
      </div>
    );
  };

  if (!restaurant) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="customer" />
      <div className="restaurant-details">
        <h1>{restaurant.name}</h1>
        {restaurant.average_rating !== undefined && (
          <div className="restaurant-rating">
            {renderStars(restaurant.average_rating)}
          </div>
        )}
        <p>
          {restaurant.address}, {restaurant.city}
        </p>
        <p>Category: {restaurant.category}</p>
        <p>Contact: {restaurant.contact}</p>
        {restaurant.images && restaurant.images.length > 0 && (
          <Gallery images={restaurant.images.map(img => img.image)} />
        )}
        <div className="menu-categories">
          {menu.map((category) => (
            <div key={category.id} className="menu-category">
              <h2>{category.category_name}</h2>
              <div className="menu-items">
                {category.items.map((item) => (
                  <div key={item.id} className="menu-item">
                    <h3 className="clickable-item-name" onClick={() => openGalleryPopup(item.images)}>
                      {item.name}
                    </h3>
                    <p className="item-description">{item.description}</p>
                    <p className="item-price">Price: {item.price} BAM</p>
                    <div className="item-quantity-controls">
                      <button onClick={() => decrementQuantity(item.id)}>-</button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || 1}
                        onChange={(e) => setItemQuantity(item.id, e.target.value)}
                      />
                      <button onClick={() => incrementQuantity(item.id)}>+</button>
                    </div>
                    <button className="add-to-basket-button" onClick={() => addToBasket(item)}>
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {isPopupOpen && <GalleryPopup images={currentItemImages} onClose={closeGalleryPopup} />}
      </div>
    </>
  );
}

export default CustomerRestaurant;
