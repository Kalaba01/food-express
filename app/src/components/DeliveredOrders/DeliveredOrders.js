import React, { useState, useEffect } from "react";
import { Header, NotificationPopup } from "../index";
import { FaDollarSign } from "react-icons/fa";
import axios from "axios";
import "../DeliveredOrders/DeliveredOrders.css";

function DeliveredOrders({ darkMode, toggleDarkMode }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isOpen: false,
  });

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchDeliveredOrders = async () => {
    const token = getToken();
    if (!token) {
      setNotification({
        message: "You are not authenticated. Please log in.",
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
      console.error("Error fetching delivered orders:", error);
      setNotification({
        message: "Error fetching delivered orders.",
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
      <div className="delivered-orders-container">
        <p>Loading...</p>
      </div>
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
          <p>No delivered orders found.</p>
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
          <h1>Delivered Orders</h1>
          <table className="delivered-orders-table">
            <thead>
              <tr>
                <th>Restaurant</th>
                <th>Restaurant Address</th>
                <th>Customer</th>
                <th>Customer Address</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.restaurant_name}</td>
                  <td>{order.restaurant_address}</td>
                  <td>{order.customer_username}</td>
                  <td>{order.customer_address}</td>
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
              <h2>Order Details</h2>
              <div className="delivered-orders-popup-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Quantity</th>
                      <th>Price</th>
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
