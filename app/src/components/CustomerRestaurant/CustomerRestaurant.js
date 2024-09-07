import React, { useState, useEffect, useContext } from "react";
import { Header, Gallery, GalleryPopup, Map, Loading } from "../index";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BasketContext } from "../../BasketContext";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import axios from "axios";
import "./CustomerRestaurant.css";

function CustomerRestaurant({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation("global");
  const { restaurantName } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentItemImages, setCurrentItemImages] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const { setBasket } = useContext(BasketContext);
  const [mapPopupOpen, setMapPopupOpen] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState({
    latitude: null,
    longitude: null,
    label: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        console.log("Fetching restaurant details for:", restaurantName);
        const response = await axios.get(
          `http://localhost:8000/api/restaurants/${encodeURIComponent(
            restaurantName
          )}/details`
        );
        console.log("Restaurant details fetched:", response.data);
        setRestaurant(response.data);
        checkOperatingHours(response.data.operating_hours);
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
      }
    };

    const fetchRestaurantMenu = async () => {
      try {
        console.log("Fetching restaurant menu for:", restaurantName);
        const response = await axios.get(
          `http://localhost:8000/api/restaurants/${encodeURIComponent(
            restaurantName
          )}/menu`
        );
        console.log("Restaurant menu fetched:", response.data);
        setMenu(response.data);
      } catch (error) {
        console.error("Error fetching restaurant menu:", error);
      }
    };

    const loadData = async () => {
      await fetchRestaurantDetails();
      await fetchRestaurantMenu();
      setIsLoading(false);
    };

    loadData();
  }, [restaurantName]);

  const openMapPopup = (latitude, longitude, label) => {
    setMapCoordinates({ latitude, longitude, label });
    setMapPopupOpen(true);
  };

  const closeMapPopup = () => {
    setMapPopupOpen(false);
  };

  const checkOperatingHours = (operatingHours) => {
    const currentDay = new Date().toLocaleString("en-US", { weekday: "long" });
    const currentTime = new Date();
    const todayHours = operatingHours.find(
      (hours) => hours.day_of_week.toLowerCase() === currentDay.toLowerCase()
    );

    if (todayHours) {
      const openingTime = new Date();
      const closingTime = new Date();

      const [openingHour, openingMinute] = todayHours.opening_time.split(":");
      const [closingHour, closingMinute] = todayHours.closing_time.split(":");

      openingTime.setHours(openingHour, openingMinute);
      closingTime.setHours(closingHour, closingMinute);

      console.log("Operating hours check:", { openingTime, closingTime });

      if (currentTime < openingTime || currentTime > closingTime) {
        setIsOpen(false);
        console.log("Restaurant is closed");
      } else {
        setIsOpen(true);
      }
    }
  };

  const setItemQuantity = (itemId, quantity) => {
    setMenu((prevState) =>
      prevState.map((category) => ({
        ...category,
        items: category.items.map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(Number(quantity), 1) }
            : item
        ),
      }))
    );
  };

  const incrementQuantity = (itemId) => {
    setMenu((prevState) =>
      prevState.map((category) => ({
        ...category,
        items: category.items.map((item) =>
          item.id === itemId
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        ),
      }))
    );
  };

  const decrementQuantity = (itemId) => {
    setMenu((prevState) =>
      prevState.map((category) => ({
        ...category,
        items: category.items.map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max((item.quantity || 1) - 1, 1) }
            : item
        ),
      }))
    );
  };

  const addToBasket = (item) => {
    const itemToAdd = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      category: item.category,
      restaurant_id: item.restaurant_id,
    };

    setBasket((prevBasket) => {
      const existingItem = prevBasket.find((i) => i.id === item.id);
      if (existingItem) {
        return prevBasket.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + itemToAdd.quantity }
            : i
        );
      } else {
        return [...prevBasket, itemToAdd];
      }
    });
  };

  const openGalleryPopup = (images) => {
    if (images.length > 0) {
      setCurrentItemImages(images.map((img) => img.image));
      setIsPopupOpen(true);
    }
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

  if (isLoading) {
    return (
      <>
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          userType="customer"
        />
        <Loading />;
      </>
    );
  }

  return (
    <>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="customer"
      />
      <div className="restaurant-details">
        <h1>{restaurant.name}</h1>
        {restaurant.average_rating !== undefined && (
          <div className="restaurant-rating">
            {renderStars(restaurant.average_rating)}
          </div>
        )}
        <p
          className="clickable-restaurant-address"
          onClick={() =>
            openMapPopup(
              restaurant.latitude,
              restaurant.longitude,
              restaurant.name
            )
          }
        >
          {restaurant.address}, {restaurant.city}
        </p>
        <p>
          {t("CustomerRestaurant.category")}: {restaurant.category}
        </p>
        <p>
          {t("CustomerRestaurant.contact")}: {restaurant.contact}
        </p>
        {restaurant.images && restaurant.images.length > 0 ? (
          <Gallery images={restaurant.images.map((img) => img.image)} />
        ) : (
          <p>{t("CustomerRestaurant.noImagesAvailable")}</p>
        )}
        <div className="menu-categories">
          {menu.map((category) => (
            <div key={category.id} className="menu-category">
              <h2>{category.category_name}</h2>
              <div className="menu-items">
                {category.items.map((item) => (
                  <div key={item.id} className="menu-item">
                    <h3
                      className="clickable-item-name"
                      onClick={() => openGalleryPopup(item.images)}
                    >
                      {item.name}
                    </h3>
                    <p className="item-description">{item.description}</p>
                    <p className="item-price">
                      {t("CustomerRestaurant.price")}: {item.price} BAM
                    </p>
                    <div className="item-quantity-controls">
                      <button onClick={() => decrementQuantity(item.id)}>
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || 1}
                        onChange={(e) =>
                          setItemQuantity(item.id, e.target.value)
                        }
                      />
                      <button onClick={() => incrementQuantity(item.id)}>
                        +
                      </button>
                    </div>
                    <button
                      className={`add-to-basket-button ${
                        !isOpen ? "disabled-button" : ""
                      }`}
                      onClick={() => addToBasket(item)}
                      disabled={!isOpen}
                      title={!isOpen ? t("CustomerRestaurant.outOfHours") : ""}
                    >
                      {t("CustomerRestaurant.add")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {mapPopupOpen &&
          mapCoordinates.latitude &&
          mapCoordinates.longitude && (
            <div className="modal">
              <div className="modal-content">
                <span className="close-button" onClick={closeMapPopup}>
                  &times;
                </span>
                <h2>{mapCoordinates.label}</h2>
                <Map
                  latitude={mapCoordinates.latitude}
                  longitude={mapCoordinates.longitude}
                  address={mapCoordinates.label}
                />
              </div>
            </div>
          )}

        {isPopupOpen && (
          <GalleryPopup
            images={currentItemImages}
            onClose={closeGalleryPopup}
          />
        )}
      </div>
    </>
  );
}

export default CustomerRestaurant;
