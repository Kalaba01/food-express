import React, { useState, useEffect } from "react";
import { Header, NotificationPopup, Map, Loading } from "../index";
import { FaDollarSign } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "../DeliveredOrders/DeliveredOrders.css";

function DeliveredOrders({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation("global");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isOpen: false,
  });
  const [mapPopupOpen, setMapPopupOpen] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState({
    latitude: null,
    longitude: null,
    label: "",
  });

  const handleAddressClick = (latitude, longitude, label) => {
    setMapCoordinates({ latitude, longitude, label });
    setMapPopupOpen(true);
  };

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchDeliveredOrders = async () => {
    const token = getToken();
    if (!token) {
      setNotification({
        message: t("DeliveredOrders.notAuthenticated"),
        type: "error",
        isOpen: true,
      });
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:8000/delivered-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrders(response.data);
    } catch (error) {
      console.error(t("DeliveredOrders.fetchError"), error);
      setNotification({
        message: t("DeliveredOrders.fetchError"),
        type: "error",
        isOpen: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveredOrders();
  }, []);

  const handleOrderDetailsClick = (order) => {
    setSelectedOrder(order);
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
    <>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="courier"
      />
      <Loading />
    </>
    );
  }

  if (!orders.length) {
    return (
      <>
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          userType="courier"
        />
        <div className="delivered-orders-container">
          <p>{t("DeliveredOrders.noOrders")}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="courier"
      />
      <div>
        <div className="delivered-orders-container">
          <h1>{t("DeliveredOrders.title")}</h1>
          <table className="delivered-orders-table">
            <thead>
              <tr>
                <th>{t("DeliveredOrders.restaurant")}</th>
                <th>{t("DeliveredOrders.restaurantAddress")}</th>
                <th>{t("DeliveredOrders.customer")}</th>
                <th>{t("DeliveredOrders.customerAddress")}</th>
                <th>{t("DeliveredOrders.price")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.restaurant_name}</td>
                  <td>
                    <span
                      className="clickable-address"
                      onClick={() =>
                        handleAddressClick(
                          order.restaurant_latitude,
                          order.restaurant_longitude,
                          order.restaurant_address
                        )
                      }
                    >
                      {order.restaurant_address}
                    </span>
                  </td>
                  <td>{order.customer_username}</td>
                  <td>
                    <span
                      className="clickable-address"
                      onClick={() =>
                        handleAddressClick(
                          order.customer_latitude,
                          order.customer_longitude,
                          order.customer_address
                        )
                      }
                    >
                      {order.customer_address}
                    </span>
                  </td>
                  <td>
                    <button
                      className="delivered-orders-price-button"
                      onClick={() => handleOrderDetailsClick(order)}
                    >
                      <FaDollarSign /> {order.total_price} BAM
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {popupOpen && selectedOrder && (
          <div className="delivered-orders-popup">
            <div className="delivered-orders-popup-content">
              <span
                className="delivered-orders-close-popup"
                onClick={closePopup}
              >
                &times;
              </span>
              <h2>{t("DeliveredOrders.orderDetails")}</h2>
              <div className="delivered-orders-popup-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>{t("DeliveredOrders.itemName")}</th>
                      <th>{t("DeliveredOrders.quantity")}</th>
                      <th>{t("DeliveredOrders.itemPrice")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.price} BAM</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {mapPopupOpen &&
          mapCoordinates.latitude &&
          mapCoordinates.longitude && (
            <div className="modal">
              <div className="modal-content">
                <span
                  className="close-button"
                  onClick={() => setMapPopupOpen(false)}
                >
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

        {notification.isOpen && (
          <NotificationPopup
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ ...notification, isOpen: false })}
          />
        )}
      </div>
    </>
  );
}

export default DeliveredOrders;
