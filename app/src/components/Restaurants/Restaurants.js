import React, { useState, useEffect } from "react";
import {
  Header,
  NotificationPopup,
  LookupTable,
  ConfirmDelete,
  Map,
  Loading,
} from "../index";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaMapPin,
  FaTrash,
  FaArrowLeft,
  FaArrowRight,
  FaCaretDown,
  FaCaretUp,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import axios from "axios";
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
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [ownerResults, setOwnerResults] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedZones, setSelectedZones] = useState([]);
  const [zonesDropdownOpen, setZonesDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetches restaurant data and zones
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
        const response = await axios.get(
          "http://localhost:8000/delivery-zones/"
        );
        setZones(response.data);
      } catch (error) {
        console.error("Error fetching delivery zones:", error);
      }
    };

    const loadData = async () => {
      await fetchRestaurants();
      await fetchZones();
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Fetches categories
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

  // Fetches items
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

  // Searches for restaurant owners based on input
  const searchOwners = async (username) => {
    if (username.length < 6) return;
    try {
      const response = await axios.get(
        `http://localhost:8000/search-owners?username=${username}`
      );
      setOwnerResults(response.data);
    } catch (error) {
      console.error("Error searching owners:", error);
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
      <div className="rating-stars">
        {item.rating_count > 0
          ? renderStars(item.total_rating / item.rating_count)
          : t("Restaurants.noRating")}
      </div>
    ),
  };

  // Handles click on a restaurant to fetch categories and open the popup
  const handleRestaurantClick = async (restaurantId) => {
    setSelectedRestaurant(restaurantId);
    await fetchCategories(restaurantId);
    setIsPopupOpen(true);
  };

  // Handles click on a category to fetch its items or close the items view
  const handleCategoryClick = async (categoryId) => {
    if (openCategoryId === categoryId) {
      setOpenCategoryId(null);
    } else {
      setOpenCategoryId(categoryId);
      await fetchItems(categoryId);
    }
  };

  // Resets the state and closes all open popups
  const resetPopup = () => {
    setIsPopupOpen(false);
    setSelectedRestaurant(null);
    setOpenCategoryId(null);
    setEditRestaurant(null);
    setIsMapPopupOpen(false);
    setSelectedOwner(null);
    setOwnerSearch("");
    setOwnerResults([]);
    setSelectedZones([]);
    setZonesDropdownOpen(false);
  };

  // Opens the restaurant edit popup and loads the restaurant details for editing
  const handleEditClick = async (restaurant) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/restaurants/${restaurant.id}`
      );
      const fetchedRestaurant = response.data;

      if (fetchedRestaurant.delivery_zone_ids) {
        setSelectedZones(fetchedRestaurant.delivery_zone_ids);
      } else {
        setSelectedZones([]);
      }

      setEditRestaurant(fetchedRestaurant);

      const ownerResponse = await axios.get(
        `http://localhost:8000/users/${fetchedRestaurant.owner_id}`
      );
      const owner = ownerResponse.data;
      setSelectedOwner(owner);
      setOwnerSearch(owner.username);

      setIsPopupOpen(true);
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
    }
  };

  // Renders checkboxes for selecting delivery zones
  const renderZoneCheckbox = (zone) => {
    return (
      <div key={zone.id} className="zone-dropdown-item">
        <input
          type="checkbox"
          value={zone.id}
          checked={selectedZones.includes(zone.id)}
          onChange={() => handleZoneSelect(zone.id)}
        />
        <label>{zone.name}</label>
      </div>
    );
  };

  // Opens the map popup to display the restaurant's location
  const handleMapClick = (restaurant) => {
    setEditRestaurant(restaurant);
    setIsMapPopupOpen(true);
  };

  // Opens the delete confirmation popup for a selected restaurant
  const handleDeleteClick = (restaurant) => {
    setRestaurantToDelete(restaurant);
    setDeletePopupOpen(true);
  };

  // Confirms the deletion of a restaurant and removes it from the list
  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8000/restaurants/${restaurantToDelete.id}`
      );
      setRestaurants(restaurants.filter((r) => r.id !== restaurantToDelete.id));
      showNotification(t("Restaurants.deleteSuccess"), "success");
    } catch (error) {
      showNotification(t("Restaurants.deleteError"), "error");
    } finally {
      setDeletePopupOpen(false);
      setRestaurantToDelete(null);
    }
  };

  // Cancels the deletion of a restaurant and closes the delete confirmation popup
  const cancelDelete = () => {
    setDeletePopupOpen(false);
    setRestaurantToDelete(null);
  };

  // Saves the edited restaurant details
  const handleSaveClick = async (event) => {
    event.preventDefault();

    if (!editRestaurant || !selectedOwner) return;

    try {
      const response = await axios.put(
        `http://localhost:8000/restaurants/${editRestaurant.id}`,
        {
          ...editRestaurant,
          owner_id: selectedOwner.id,
          delivery_zone_ids: selectedZones,
        }
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

    if (!selectedOwner || selectedZones.length === 0) {
      showNotification(t("Restaurants.selectOwnerOrZones"), "error");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/restaurants/", {
        ...editRestaurant,
        owner_id: selectedOwner.id,
        delivery_zone_ids: selectedZones,
      });
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

  // Renders the star rating based on the average rating of a restaurant
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

  // Toggles the selection of a delivery zone
  const handleZoneSelect = (zoneId) => {
    setSelectedZones((prevSelectedZones) =>
      prevSelectedZones.includes(zoneId)
        ? prevSelectedZones.filter((id) => id !== zoneId)
        : [...prevSelectedZones, zoneId]
    );
  };

  // Renders the list of categories for the selected restaurant
  const renderCategories = () => {
    const restaurantCategories = categories[selectedRestaurant] || [];
    return (
      <div className="categories-wrapper">
        <button className="scroll-button" onClick={scrollLeft}>
          <FaArrowLeft />
        </button>
        <div className="categories-container">
          {restaurantCategories.map((category) => (
            <div
              key={category.id}
              className={`category-card ${
                openCategoryId === category.id ? "open" : ""
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
        <button className="scroll-button" onClick={scrollRight}>
          <FaArrowRight />
        </button>
      </div>
    );
  };

  // Renders the list of items for the selected category
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

  // Scrolls the category list to the left
  const scrollLeft = () => {
    const container = document.querySelector(".categories-container");
    container.scrollBy({
      left: -container.offsetWidth / 2,
      behavior: "smooth",
    });
  };

  // Scrolls the category list to the right
  const scrollRight = () => {
    const container = document.querySelector(".categories-container");
    container.scrollBy({ left: container.offsetWidth / 2, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <>
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          userType="courier"
        />
        <Loading />;
      </>
    );
  }

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
              category: "",
              contact: "",
              delivery_zone_ids: [],
            });
            setSelectedZones([]);
            setZonesDropdownOpen(false);
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
              handler: (restaurant) => handleDeleteClick(restaurant),
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
            <Map
              latitude={editRestaurant.latitude}
              longitude={editRestaurant.longitude}
              address={editRestaurant.address}
            />
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
                editRestaurant.id ? handleSaveClick : handleNewRestaurantSave
              }
            >
              <div className="input-group">
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
              </div>

              <div className="input-group">
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
              </div>

              <div className="input-group">
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
              </div>

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

              <div className="zone-selection">
                <div className="zone-dropdown">
                  <div
                    className="zone-dropdown-header"
                    onClick={() => setZonesDropdownOpen(!zonesDropdownOpen)}
                  >
                    <span>{t("Restaurants.selectZones")}</span>
                    {zonesDropdownOpen ? <FaCaretUp /> : <FaCaretDown />}
                  </div>
                  {zonesDropdownOpen && (
                    <div className="zone-dropdown-content">
                      {zones.map(renderZoneCheckbox)}
                    </div>
                  )}
                </div>
              </div>

              <div className="owner-search-container">
                <input
                  type="text"
                  value={ownerSearch}
                  onChange={(e) => {
                    setOwnerSearch(e.target.value);
                    searchOwners(e.target.value);
                  }}
                  placeholder={t("Restaurants.searchOwner")}
                  className="input-field"
                  required
                />
                {ownerResults.length > 0 && (
                  <ul className="owner-search-results">
                    {ownerResults.map((owner) => (
                      <li
                        key={owner.id}
                        onClick={() => {
                          setSelectedOwner(owner);
                          setOwnerSearch(owner.username);
                          setOwnerResults([]);
                        }}
                      >
                        {owner.username}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button type="submit" className="save-button">
                {editRestaurant.id
                  ? t("Restaurants.save")
                  : t("Restaurants.create")}
              </button>
            </form>
          </div>
        </div>
      )}

      {deletePopupOpen && (
        <ConfirmDelete
          isOpen={deletePopupOpen}
          message={t("Restaurants.confirmDeleteMessage")}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}

export default Restaurants;
