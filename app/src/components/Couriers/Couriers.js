import React, { useState, useEffect } from "react";
import {
  Header,
  LookupTable,
  ConfirmDelete,
  NotificationPopup,
  Map,
} from "../index";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import "../LookupTable/LookupTable.css";

function Couriers({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation("global");
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editCourier, setEditCourier] = useState(null);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [courierToDelete, setCourierToDelete] = useState(null);

  const [newCourier, setNewCourier] = useState({
    user_id: null,
    username: "",
    restaurant_id: null,
    restaurant: "",
    vehicle_type: "bike",
    halal_mode: false,
  });

  const [userSearchResults, setUserSearchResults] = useState([]);
  const [restaurantSearchResults, setRestaurantSearchResults] = useState([]);

  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isOpen: false,
  });

  const [isMapPopupOpen, setIsMapPopupOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsMapPopupOpen(true);
  };

  const fetchCouriers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/couriers/");
      setCouriers(response.data || []);
    } catch (error) {
      console.error("Error fetching couriers:", error);
      setCouriers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouriers();
  }, []);

  const handleCourierSearch = async (query) => {
    if (query.trim() === "") {
      setUserSearchResults([]);
      return;
    }
    if (query.length >= 3) {
      try {
        const response = await axios.get(
          `http://localhost:8000/search-couriers/?username=${query}`
        );
        setUserSearchResults(response.data);
      } catch (error) {
        console.error("Error searching users:", error);
      }
    } else {
      setUserSearchResults([]);
    }
  };

  const handleRestaurantSearch = async (query) => {
    if (query.trim() === "") {
      setRestaurantSearchResults([]);
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8000/search-restaurants/?name=${query}`
      );
      setRestaurantSearchResults(response.data);
    } catch (error) {
      console.error("Error searching restaurants:", error);
    }
  };

  const handleCreateCourier = () => {
    setNewCourier({
      user_id: null,
      restaurant_id: null,
      vehicle_type: "bike",
      halal_mode: false,
    });
    setIsCreatePopupOpen(true);
  };

  const handleSelectUser = (id, username) => {
    setNewCourier({ ...newCourier, user_id: id, username: username });
    setUserSearchResults([]);
  };

  const handleSelectRestaurant = (id, restaurantName) => {
    setNewCourier({
      ...newCourier,
      restaurant_id: id,
      restaurant: restaurantName,
    });
    setRestaurantSearchResults([]);
  };

  const handleSaveCourier = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/couriers/",
        newCourier
      );
      setCouriers([...couriers, response.data]);
      setNotification({
        message: t("Couriers.courierCreated"),
        type: "success",
        isOpen: true,
      });
      setIsCreatePopupOpen(false);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setNotification({
          message: t("Couriers.courierAlreadyAssigned"),
          type: "error",
          isOpen: true,
        });
      } else {
        setNotification({
          message: t("Couriers.errorCreatingCourier"),
          type: "error",
          isOpen: true,
        });
      }
      console.error("Error creating courier:", error);
    }
  };

  const handleEditCourier = (courier) => {
    setEditCourier(courier);
    setIsEditPopupOpen(true);
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!editCourier || !editField) return;

    const updateData = { [editField]: editValue };

    try {
      const response = await axios.put(
        `http://localhost:8000/couriers/${editCourier.id}`,
        updateData
      );
      setCouriers(
        couriers.map((courier) =>
          courier.id === editCourier.id
            ? { ...courier, ...response.data }
            : courier
        )
      );
      setNotification({
        message: t("Couriers.courierUpdated"),
        type: "success",
        isOpen: true,
      });
      setIsEditPopupOpen(false);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setNotification({
          message: t("Couriers.courierAlreadyAssigned"),
          type: "error",
          isOpen: true,
        });
      } else {
        setNotification({
          message: t("Couriers.errorUpdatingCourier"),
          type: "error",
          isOpen: true,
        });
      }
      console.error("Error updating courier:", error);
    }
  };

  const handleDeleteCourier = (courierId) => {
    setCourierToDelete(courierId);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/couriers/${courierToDelete}`);
      setCouriers(couriers.filter((courier) => courier.id !== courierToDelete));
      setNotification({
        message: t("Couriers.courierDeleted"),
        type: "success",
        isOpen: true,
      });
    } catch (error) {
      setNotification({
        message: t("Couriers.errorDeletingCourier"),
        type: "error",
        isOpen: true,
      });
      console.error("Error deleting courier:", error);
    } finally {
      setConfirmDeleteOpen(false);
      setCourierToDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteOpen(false);
    setCourierToDelete(null);
  };

  const columns = [
    t("Couriers.name"),
    t("Couriers.restaurant"),
    t("Couriers.vehicle"),
    t("Couriers.wallet"),
    t("Couriers.halal"),
  ];

  const actions = [
    {
      label: <FaEdit />,
      className: "edit-button",
      handler: handleEditCourier,
    },
    {
      label: <FaTrash />,
      className: "delete-button",
      handler: (courier) => handleDeleteCourier(courier.id),
    },
  ];

  const customRenderers = {
    [t("Couriers.name")]: (item) => item.user_name,
    [t("Couriers.restaurant")]: (item) => (
      <span
        className="restaurant-name-clickable"
        onClick={() => handleRestaurantClick(item)}
      >
        {item.restaurant_name}
      </span>
    ),
    [t("Couriers.vehicle")]: (item) => item.vehicle_type,
    [t("Couriers.wallet")]: (item) => `${item.wallet_amount} BAM`,
    [t("Couriers.halal")]: (item) =>
      item.halal_mode ? t("Couriers.yes") : t("Couriers.no"),
  };

  if (loading) {
    return (
      <div>
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          userType="administrator"
        />
        <div className="couriers-container">
          <h1>{t("Couriers.title")}</h1>
          <p>{t("Couriers.loading")}</p>
        </div>
      </div>
    );
  }

  if (!couriers || couriers.length === 0) {
    return (
      <div>
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          userType="administrator"
        />
        <div className="couriers-container">
          <h1>{t("Couriers.title")}</h1>
          <p>{t("Couriers.noData")}</p>
          <button className="create-button" onClick={handleCreateCourier}>
            <FaPlus /> {t("Couriers.create")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="administrator"
      />
      <div className="couriers-container">
        <h1>{t("Couriers.title")}</h1>
        <button
          className="couriers-create-button"
          onClick={handleCreateCourier}
        >
          <FaPlus /> {t("Couriers.create")}
        </button>
        <LookupTable
          columns={columns}
          data={couriers}
          showActions={true}
          actions={actions}
          customRenderers={customRenderers}
        />
      </div>

      {isCreatePopupOpen && (
        <div className="couriers-modal">
          <div className="couriers-modal-content">
            <span
              className="couriers-close-button"
              onClick={() => setIsCreatePopupOpen(false)}
            >
              &times;
            </span>
            <h2>{t("Couriers.createCourier")}</h2>

            <form onSubmit={handleSaveCourier} className="couriers-form">
              <div className="couriers-form-group full-width">
                <label htmlFor="username">{t("Couriers.name")}</label>
                <input
                  id="username"
                  type="text"
                  value={newCourier.username}
                  onChange={(e) => handleCourierSearch(e.target.value)}
                  className="couriers-input-field"
                  required
                />
                {userSearchResults.length > 0 && (
                  <ul className="couriers-search-results">
                    {userSearchResults.map((user) => (
                      <li
                        key={user.id}
                        onClick={() => handleSelectUser(user.id, user.username)}
                      >
                        {user.username}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="couriers-form-group full-width">
                <label htmlFor="restaurant">{t("Couriers.restaurant")}</label>
                <input
                  id="restaurant"
                  type="text"
                  value={newCourier.restaurant}
                  onChange={(e) => handleRestaurantSearch(e.target.value)}
                  className="couriers-input-field"
                  required
                />
                {restaurantSearchResults.length > 0 && (
                  <ul className="couriers-search-results">
                    {restaurantSearchResults.map((restaurant) => (
                      <li
                        key={restaurant.id}
                        onClick={() =>
                          handleSelectRestaurant(restaurant.id, restaurant.name)
                        }
                      >
                        {restaurant.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="couriers-form-group full-width">
                <label htmlFor="vehicle">{t("Couriers.vehicle")}</label>
                <select
                  id="vehicle"
                  value={newCourier.vehicle_type}
                  onChange={(e) =>
                    setNewCourier({
                      ...newCourier,
                      vehicle_type: e.target.value,
                    })
                  }
                  className="couriers-input-field"
                  required
                >
                  <option value="bike">{t("Couriers.bike")}</option>
                  <option value="car">{t("Couriers.car")}</option>
                </select>
              </div>

              <div className="couriers-form-group full-width">
                <label htmlFor="halal">{t("Couriers.halal")}</label>
                <input
                  id="halal"
                  type="checkbox"
                  checked={newCourier.halal_mode}
                  onChange={(e) =>
                    setNewCourier({
                      ...newCourier,
                      halal_mode: e.target.checked,
                    })
                  }
                  className="couriers-checkbox-field"
                />
              </div>

              <button type="submit" className="couriers-save-button">
                {t("Couriers.save")}
              </button>
            </form>
          </div>
        </div>
      )}

      {isEditPopupOpen && (
        <div className="couriers-modal">
          <div className="couriers-modal-content">
            <span
              className="couriers-close-button"
              onClick={() => setIsEditPopupOpen(false)}
            >
              &times;
            </span>
            <h2>{t("Couriers.editCourier")}</h2>
            <form onSubmit={handleSaveEdit} className="couriers-form">
              <select
                onChange={(e) => {
                  setEditField(e.target.value);
                  setEditValue(editCourier[e.target.value]);
                }}
                value={editField}
                className="couriers-select-field"
                required
              >
                <option value="">{t("Couriers.selectField")}</option>
                <option value="user_name">{t("Couriers.name")}</option>
                <option value="restaurant_name">
                  {t("Couriers.restaurant")}
                </option>
                <option value="vehicle_type">{t("Couriers.vehicle")}</option>
                <option value="halal_mode">{t("Couriers.halal")}</option>
              </select>
              {editField && (
                <>
                  {editField === "vehicle_type" ? (
                    <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="couriers-input-field"
                      required
                    >
                      <option value="bike">{t("Couriers.bike")}</option>
                      <option value="car">{t("Couriers.car")}</option>
                    </select>
                  ) : editField === "halal_mode" ? (
                    <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="couriers-input-field"
                      required
                    >
                      <option value="true">{t("Couriers.yes")}</option>
                      <option value="false">{t("Couriers.no")}</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="couriers-input-field"
                      required
                    />
                  )}
                  <button type="submit" className="couriers-save-button">
                    {t("Couriers.save")}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {isMapPopupOpen && selectedRestaurant && (
        <div className="modal">
          <div className="modal-content">
            <span
              className="close-button"
              onClick={() => setIsMapPopupOpen(false)}
            >
              &times;
            </span>
            <h2>{t("Couriers.restaurantLocation")}</h2>
            <Map
              latitude={selectedRestaurant.latitude}
              longitude={selectedRestaurant.longitude}
              address={selectedRestaurant.restaurant_name}
            />
          </div>
        </div>
      )}

      <ConfirmDelete
        isOpen={confirmDeleteOpen}
        message={t("Couriers.confirmDeleteMessage")}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {notification.isOpen && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, isOpen: false })}
        />
      )}
    </div>
  );
}

export default Couriers;
