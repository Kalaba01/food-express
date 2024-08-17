import React, { useState, useEffect } from "react";
import { Header, LookupTable, ConfirmDelete } from "../index";
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
    username: "",
    restaurant: "",
    vehicle: "bike",
    halal: false,
  });

  const [userSearchResults, setUserSearchResults] = useState([]);
  const [restaurantSearchResults, setRestaurantSearchResults] = useState([]);

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

  const handleUserSearch = async (query) => {
    if (query.length >= 6) {
      try {
        const response = await axios.get(
          `http://localhost:8000/search-users/?username=${query}`
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
      username: "",
      restaurant: "",
      vehicle_type: "bike",
      halal_mode: false,
      wallet_amount: 0,
      wallet_details: "",
    });
    setIsCreatePopupOpen(true);
  };

  const handleSelectUser = (username, id) => {
    setNewCourier({ ...newCourier, username, user_id: id });
    setUserSearchResults([]);
  };

  const handleSelectRestaurant = (restaurant, id) => {
    setNewCourier({ ...newCourier, restaurant, restaurant_id: id });
    setRestaurantSearchResults([]);
  };

  const handleSaveCourier = async (event) => {
    event.preventDefault();
    try {
      await axios.post("http://localhost:8000/couriers/", newCourier);
      setCouriers([...couriers, newCourier]);
      await fetchCouriers(); 
      setIsCreatePopupOpen(false);
    } catch (error) {
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
      await axios.put(
        `http://localhost:8000/couriers/${editCourier.id}`,
        updateData
      );
      setCouriers(
        couriers.map((courier) =>
          courier.id === editCourier.id
            ? { ...courier, ...updateData }
            : courier
        )
      );
      setIsEditPopupOpen(false);
    } catch (error) {
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
    } catch (error) {
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
    [t("Couriers.restaurant")]: (item) => item.restaurant_name,
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
        <button className="create-button" onClick={handleCreateCourier}>
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
        <div className="modal">
          <div className="modal-content">
            <span
              className="close-button"
              onClick={() => setIsCreatePopupOpen(false)}
            >
              &times;
            </span>
            <h2>{t("Couriers.createCourier")}</h2>
            <form onSubmit={handleSaveCourier} className="courier-form">
              <div className="form-group">
                <label htmlFor="username">{t("Couriers.name")}</label>
                <input
                  id="username"
                  type="text"
                  value={newCourier.username}
                  onChange={(e) => {
                    setNewCourier({ ...newCourier, username: e.target.value });
                    handleUserSearch(e.target.value);
                  }}
                  className="input-field"
                  required
                />
                {userSearchResults.length > 0 && (
                  <ul className="search-results">
                    {userSearchResults.map((user) => (
                      <li
                        key={user.id}
                        onClick={() => handleSelectUser(user.username, user.id)}
                      >
                        {user.username}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="restaurant">{t("Couriers.restaurant")}</label>
                <input
                  id="restaurant"
                  type="text"
                  value={newCourier.restaurant}
                  onChange={(e) => {
                    setNewCourier({
                      ...newCourier,
                      restaurant: e.target.value,
                    });
                    handleRestaurantSearch(e.target.value);
                  }}
                  className="input-field"
                  required
                />
                {restaurantSearchResults.length > 0 && (
                  <ul className="search-results">
                    {restaurantSearchResults.map((restaurant) => (
                      <li
                        key={restaurant.id}
                        onClick={() =>
                          handleSelectRestaurant(restaurant.name, restaurant.id)
                        }
                      >
                        {restaurant.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="vehicle">{t("Couriers.vehicle")}</label>
                <select
                  id="vehicle"
                  value={newCourier.vehicle}
                  onChange={(e) =>
                    setNewCourier({ ...newCourier, vehicle: e.target.value })
                  }
                  className="input-field"
                  required
                >
                  <option value="bike">{t("Couriers.bike")}</option>
                  <option value="car">{t("Couriers.car")}</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="halal">{t("Couriers.halal")}</label>
                <input
                  id="halal"
                  type="checkbox"
                  checked={newCourier.halal}
                  onChange={(e) =>
                    setNewCourier({ ...newCourier, halal: e.target.checked })
                  }
                  className="checkbox-field"
                />
              </div>
              <button type="submit" className="save-button">
                {t("Couriers.save")}
              </button>
            </form>
          </div>
        </div>
      )}

      {isEditPopupOpen && (
        <div className="modal">
          <div className="modal-content">
            <span
              className="close-button"
              onClick={() => setIsEditPopupOpen(false)}
            >
              &times;
            </span>
            <h2>{t("Couriers.editCourier")}</h2>
            <form onSubmit={handleSaveEdit} className="courier-form">
              <select
                onChange={(e) => {
                  setEditField(e.target.value);
                  setEditValue(editCourier[e.target.value]);
                }}
                value={editField}
                className="select-field"
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
                      className="input-field"
                      required
                    >
                      <option value="bike">{t("Couriers.bike")}</option>
                      <option value="car">{t("Couriers.car")}</option>
                    </select>
                  ) : editField === "halal_mode" ? (
                    <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="input-field"
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
                      className="input-field"
                      required
                    />
                  )}
                  <button type="submit" className="save-button">
                    {t("Couriers.save")}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      <ConfirmDelete
        isOpen={confirmDeleteOpen}
        message={t("Couriers.confirmDeleteMessage")}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

export default Couriers;
