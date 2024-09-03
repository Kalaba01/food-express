import React, { useState, useEffect } from "react";
import { Header, NotificationPopup } from "../index";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "./DeliverOrder.css";

function DeliverOrder({ darkMode, toggleDarkMode }) {
  const [orders, setOrders] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const courierId = decodedToken ? decodedToken.id : null;

      if (!courierId) {
        console.error("Courier ID not found");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8000/courier/deliver-order/?courier_id=${courierId}`
        );
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleShowItems = (items) => {
    const content = (
      <>
        <h3>Order Items</h3>
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              <strong>{item.name}</strong> - {item.quantity} x {item.price} BAM
            </li>
          ))}
        </ul>
      </>
    );
    setPopupContent(content);
    setIsPopupOpen(true);
  };

  const handleShowPaymentDetails = (optimalChange) => {
    let parsedChange = JSON.parse(optimalChange);

    const content = (
      <>
        <h3>Payment Method Details</h3>
        <p>The optimal change is:</p>
        <ul>
          {parsedChange.map((change, index) => (
            <li key={index}>
              <strong>{change}</strong>
            </li>
          ))}
        </ul>
      </>
    );
    setPopupContent(content);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setPopupContent(null);
  };

  const handleFinishOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
  
      await axios.post(
        `http://localhost:8000/courier/finish-order/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotification({ message: "Order successfully finished", type: "success" });
      
      const decodedToken = jwtDecode(token);
      const courierId = decodedToken ? decodedToken.id : null;
  
      const response = await axios.get(
        `http://localhost:8000/courier/deliver-order/?courier_id=${courierId}`
      );
      setOrders(response.data);
    } catch (error) {
      setNotification({
        message: error.response?.data?.detail || "An error occurred while finishing the order",
        type: "error"
      });
    }
  };

  return (
    <>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="courier"
      />
      <div className="deliver-order">
        <h2>Deliver Orders</h2>
        {orders.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Restaurant</th>
                <th>Address</th>
                <th>Contact</th>
                <th>Customer</th>
                <th>Customer Address</th>
                <th>Customer Contact</th>
                <th>Price</th>
                <th>Payment Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.restaurant_name}</td>
                  <td>{order.restaurant_address}</td>
                  <td>{order.restaurant_contact}</td>
                  <td>{order.customer_username}</td>
                  <td>{order.customer_address}</td>
                  <td>{order.customer_contact}</td>
                  <td
                    className="clickable-price"
                    onClick={() => handleShowItems(order.items)}
                  >
                    {order.total_price} BAM
                  </td>
                  <td
                    className={order.optimal_change ? "clickable-payment" : ""}
                    onClick={
                      order.optimal_change
                        ? () => handleShowPaymentDetails(order.optimal_change)
                        : null
                    }
                  >
                    {order.payment_method}
                  </td>
                  <td>
                    <button onClick={() => handleFinishOrder(order.id)}>
                      Finish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No orders to deliver.</p>
        )}

        {notification.message && (
          <NotificationPopup message={notification.message} type={notification.type} />
        )}

        {isPopupOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <span className="close-popup" onClick={handleClosePopup}>
                &times;
              </span>
              {popupContent}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default DeliverOrder;
