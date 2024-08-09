import React, { useState, useEffect } from "react";
import { Header, NotificationPopup, LookupTable } from "../index";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FaStar, FaStarHalfAlt, FaRegStar, FaMapPin, FaTrash, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import axios from "axios";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import "../LookupTable/LookupTable.css";

function Restaurants({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation("global");
  const [restaurants, setRestaurants] = useState([]);
  const [zones, setZones] = useState([]);
  const [editRestaurant, setEditRestaurant] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isMapPopupOpen, setIsMapPopupOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [categories, setCategories] = useState({});
  const [items, setItems] = useState({});
  const [openCategoryId, setOpenCategoryId] = useState(null); // State za otvorenu kategoriju
  const [notification, setNotification] = useState({ message: "", type: "" });

  const customMarkerIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get("http://localhost:8000/restaurants/");
        setRestaurants(response.data);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };

    const fetchZones = async () => {
      try {
        const response = await axios.get("http://localhost:8000/delivery-zones/");
        setZones(response.data);
      } catch (error) {
        console.error("Error fetching delivery zones:", error);
      }
    };

    fetchRestaurants();
    fetchZones();
  }, []);

  const fetchCategories = async (restaurantId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/menu-categories?restaurant_id=${restaurantId}`
      );
      setCategories((prev) => ({ ...prev, [restaurantId]: response.data }));
    } catch (error) {
      console.error("Error fetching menu categories:", error);
    }
  };

  const fetchItems = async (categoryId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/items?category_id=${categoryId}`
      );
      setItems((prev) => ({ ...prev, [categoryId]: response.data }));
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const columns = [
    t("Restaurants.name"),
    t("Restaurants.city"),
    t("Restaurants.address"),
    t("Restaurants.category"),
    t("Restaurants.rating"),
  ];

  const customRenderers = {
    [t("Restaurants.name")]: (item) => (
      <div
        onClick={() => handleRestaurantClick(item.id)}
        className={`restaurant-row ${
          selectedRestaurant === item.id ? "active" : ""
        }`}
      >
        {item.name}
      </div>
    ),
    [t("Restaurants.address")]: (item) => (
      <span className="address-link" onClick={() => handleMapClick(item)}>
        {item.address}
      </span>
    ),
    [t("Restaurants.rating")]: (item) => (
      <div className="rating-stars">{renderStars(item.rating)}</div>
    ),
  };  

  const handleRestaurantClick = async (restaurantId) => {
    setSelectedRestaurant(restaurantId);
    await fetchCategories(restaurantId);
    setIsPopupOpen(true);
  };

  const handleCategoryClick = async (categoryId) => {
    if (openCategoryId === categoryId) {
      // Ako je ista kategorija kliknuta opet, zatvori listu itema
      setOpenCategoryId(null);
    } else {
      // Inače, prikaži novu listu itema
      setOpenCategoryId(categoryId);
      await fetchItems(categoryId);
    }
  };

  const resetPopup = () => {
    setIsPopupOpen(false);
    setSelectedRestaurant(null);
    setOpenCategoryId(null); // Resetuj otvorenu kategoriju
    setEditRestaurant(null);
    setIsMapPopupOpen(false);
  };

  const handleEditClick = (restaurant) => {
    setEditRestaurant(restaurant);
    setIsPopupOpen(true);
  };

  const handleMapClick = (restaurant) => {
    setEditRestaurant(restaurant);
    setIsMapPopupOpen(true);
  };

  const handleDeleteClick = async (restaurantId) => {
    try {
      await axios.delete(`http://localhost:8000/restaurants/${restaurantId}`);
      setRestaurants(
        restaurants.filter((restaurant) => restaurant.id !== restaurantId)
      );
      showNotification(t("FormPopup.common.success.delete"), "success");
    } catch (error) {
      showNotification(t("FormPopup.common.errors.requestFailed"), "error");
    }
  };

  const handleSaveClick = async (event) => {
    event.preventDefault();

    if (!editRestaurant) return;

    try {
      const response = await axios.put(
        `http://localhost:8000/restaurants/${editRestaurant.id}`,
        editRestaurant
      );
      setRestaurants(
        restaurants.map((restaurant) =>
          restaurant.id === editRestaurant.id ? response.data : restaurant
        )
      );
      resetPopup();
      showNotification(t("FormPopup.common.success.edit"), "success");
    } catch (error) {
      showNotification(t("FormPopup.common.errors.requestFailed"), "error");
    }
  };

  const handleNewRestaurantSave = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8000/restaurants/",
        editRestaurant
      );
      setRestaurants([...restaurants, response.data]);
      resetPopup();
      showNotification(t("FormPopup.common.success.create"), "success");
    } catch (error) {
      showNotification(t("FormPopup.common.errors.requestFailed"), "error");
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const renderStars = (rating) => {
    const roundedRating = Math.round(rating * 2) / 2;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(roundedRating)) {
        stars.push(<FaStar key={i} className="star-icon" />);
      } else if (
        i === Math.ceil(roundedRating) &&
        !Number.isInteger(roundedRating)
      ) {
        stars.push(<FaStarHalfAlt key={i} className="star-icon" />);
      } else {
        stars.push(<FaRegStar key={i} className="star-icon" />);
      }
    }
    return stars.length > 0 ? stars : <span>{t("Restaurants.noRating")}</span>;
  };

  const renderCategories = () => {
    const restaurantCategories = categories[selectedRestaurant] || [];
    return (
      <div className="categories-wrapper">
        <button className="scroll-button" onClick={scrollLeft}><FaArrowLeft /></button>
        <div className="categories-container">
          {restaurantCategories.map((category) => (
            <div
              key={category.id}
              className={`category-card ${
                openCategoryId === category.id ? 'open' : ''
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
        <button className="scroll-button" onClick={scrollRight}><FaArrowRight /></button>
      </div>
    );
  };

  const renderItems = () => {
    if (!openCategoryId) return null;

    const categoryItems = items[openCategoryId] || [];
    return (
      <div className="items-container">
        {categoryItems.map((item) => (
          <div key={item.id} className="item-card">
            {item.name}
          </div>
        ))}
      </div>
    );
  };

  const scrollLeft = () => {
    const container = document.querySelector('.categories-container');
    container.scrollBy({ left: -container.offsetWidth / 2, behavior: 'smooth' });
  };

  const scrollRight = () => {
    const container = document.querySelector('.categories-container');
    container.scrollBy({ left: container.offsetWidth / 2, behavior: 'smooth' });
  };

  return (
    <div>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="administrator"
      />
      {notification.message && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
        />
      )}
      <div className="restaurants-container">
        <h1>{t("Restaurants.title")}</h1>
        <button
          className="create-button"
          onClick={() => {
            setEditRestaurant({
              name: "",
              address: "",
              city: "",
              latitude: "",
              longitude: "",
              rating: "",
              category: "",
              contact: "",
              delivery_zone_id: "",
            });
            setIsPopupOpen(true);
          }}
        >
          {t("Restaurants.create")}
        </button>
        <LookupTable
          columns={columns}
          data={restaurants}
          actions={[
            {
              label: t("Restaurants.edit"),
              className: "edit-button",
              handler: handleEditClick,
            },
            {
              label: <FaMapPin />,
              className: "map-icon",
              handler: handleMapClick,
            },
            {
              label: <FaTrash />,
              className: "delete-button",
              handler: (restaurant) => handleDeleteClick(restaurant.id),
            },
          ]}
          customRenderers={customRenderers}
          showActions
        />
      </div>

      {isPopupOpen && selectedRestaurant && (
        <div className="modal">
          <div className="modal-content category-modal">
            <span className="close-button" onClick={resetPopup}>
              &times;
            </span>
            <h2>{t("Restaurants.menuCategories")}</h2>
            {renderCategories()}
            {renderItems()}
          </div>
        </div>
      )}

      {isMapPopupOpen && editRestaurant && (
        <div className="modal">
          <div className="modal-content map-popup">
            <span className="close-button" onClick={resetPopup}>
              &times;
            </span>
            <h2>{t("Restaurants.viewLocation")}</h2>
            <MapContainer
              style={{ height: "400px", width: "100%" }}
              center={[editRestaurant.latitude, editRestaurant.longitude]}
              zoom={15}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker
                position={[editRestaurant.latitude, editRestaurant.longitude]}
                icon={customMarkerIcon}
              >
                <Popup>{editRestaurant.address}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}

      {isPopupOpen && !selectedRestaurant && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={resetPopup}>
              &times;
            </span>
            <h2>
              {editRestaurant.id
                ? t("Restaurants.editRestaurant")
                : t("Restaurants.createRestaurant")}
            </h2>
            <form
              onSubmit={
                editRestaurant.id
                  ? handleSaveClick
                  : handleNewRestaurantSave
              }
            >
              <input
                type="text"
                value={editRestaurant.name}
                onChange={(e) =>
                  setEditRestaurant({
                    ...editRestaurant,
                    name: e.target.value,
                  })
                }
                placeholder={t("Restaurants.name")}
                className="input-field"
                required
              />
              <input
                type="text"
                value={editRestaurant.address}
                onChange={(e) =>
                  setEditRestaurant({
                    ...editRestaurant,
                    address: e.target.value,
                  })
                }
                placeholder={t("Restaurants.address")}
                className="input-field"
                required
              />
              <input
                type="text"
                value={editRestaurant.city}
                onChange={(e) =>
                  setEditRestaurant({
                    ...editRestaurant,
                    city: e.target.value,
                  })
                }
                placeholder={t("Restaurants.city")}
                className="input-field"
                required
              />
              <input
                type="text"
                value={editRestaurant.latitude}
                onChange={(e) =>
                  setEditRestaurant({
                    ...editRestaurant,
                    latitude: e.target.value,
                  })
                }
                placeholder={t("Restaurants.latitude")}
                className="input-field"
                required
              />
              <input
                type="text"
                value={editRestaurant.longitude}
                onChange={(e) =>
                  setEditRestaurant({
                    ...editRestaurant,
                    longitude: e.target.value,
                  })
                }
                placeholder={t("Restaurants.longitude")}
                className="input-field"
                required
              />
              <input
                type="text"
                value={editRestaurant.rating}
                onChange={(e) =>
                  setEditRestaurant({
                    ...editRestaurant,
                    rating: e.target.value,
                  })
                }
                placeholder={t("Restaurants.rating")}
                className="input-field"
                required
              />
              <input
                type="text"
                value={editRestaurant.category}
                onChange={(e) =>
                  setEditRestaurant({
                    ...editRestaurant,
                    category: e.target.value,
                  })
                }
                placeholder={t("Restaurants.category")}
                className="input-field"
                required
              />
              <input
                type="text"
                value={editRestaurant.contact}
                onChange={(e) =>
                  setEditRestaurant({
                    ...editRestaurant,
                    contact: e.target.value,
                  })
                }
                placeholder={t("Restaurants.contact")}
                className="input-field"
                required
              />
              <select
                value={editRestaurant.delivery_zone_id || ""}
                onChange={(e) =>
                  setEditRestaurant({
                    ...editRestaurant,
                    delivery_zone_id: parseInt(e.target.value),
                  })
                }
                className="input-field"
                required
              >
                <option value="">{t("Restaurants.selectZone")}</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="save-button">
                {editRestaurant.id
                  ? t("Restaurants.save")
                  : t("Restaurants.create")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Restaurants;
