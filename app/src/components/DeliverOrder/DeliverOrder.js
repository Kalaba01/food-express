import React, { useState, useEffect } from "react";
import { Header, NotificationPopup, Map, Loading } from "../index";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "./DeliverOrder.css";

function DeliverOrder({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation("global");
  const [orders, setOrders] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect fetches the list of orders for the logged-in courier on component mount
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
          `http://localhost:8000/courier/deliver-order/?user_id=${courierId}`
        );
        setOrders(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // handleShowItems displays a popup with the items of the selected order
  const handleShowItems = (items) => {
    const content = (
      <>
        <h3>{t("DeliverOrder.orderItems")}</h3>
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

   // handleShowPaymentDetails displays payment details including the optimal change
  const handleShowPaymentDetails = (optimalChange) => {
    let parsedChange = JSON.parse(optimalChange);

    const content = (
      <>
        <h3>{t("DeliverOrder.paymentDetails")}</h3>
        <p>{t("DeliverOrder.optimalChange")}</p>
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

  // handleClosePopup closes the currently open popup
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setPopupContent(null);
    setMapCoordinates(null);
  };

  // handleShowMap displays the map popup with the coordinates of a selected address
  const handleShowMap = (latitude, longitude, address) => {
    setMapCoordinates({ latitude, longitude, address });
    setIsPopupOpen(true);
  };

  // handleFinishOrder allows the courier to mark an order as finished
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

      setNotification({
        message: t("DeliverOrder.orderFinished"),
        type: "success",
      });

      const decodedToken = jwtDecode(token);
      const courierId = decodedToken ? decodedToken.id : null;

      const response = await axios.get(
        `http://localhost:8000/courier/deliver-order/?user_id=${courierId}`
      );
      setOrders(response.data);
    } catch (error) {
      setNotification({
        message:
          error.response?.data?.detail || t("DeliverOrder.errorFinishingOrder"),
        type: "error",
      });
    }
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
    <>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="courier"
      />
      <div className="deliver-order">
        <h2>{t("DeliverOrder.title")}</h2>
        {orders.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>{t("DeliverOrder.restaurant")}</th>
                <th>{t("DeliverOrder.restaurantAddress")}</th>
                <th>{t("DeliverOrder.restaurantContact")}</th>
                <th>{t("DeliverOrder.customer")}</th>
                <th>{t("DeliverOrder.customerAddress")}</th>
                <th>{t("DeliverOrder.customerContact")}</th>
                <th>{t("DeliverOrder.price")}</th>
                <th>{t("DeliverOrder.paymentMethod")}</th>
                <th>{t("DeliverOrder.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.restaurant_name}</td>
                  <td
                    className="clickable-address"
                    onClick={() =>
                      handleShowMap(
                        order.restaurant_latitude,
                        order.restaurant_longitude,
                        order.restaurant_address
                      )
                    }
                  >
                    {order.restaurant_address}
                  </td>
                  <td>{order.restaurant_contact}</td>
                  <td>{order.customer_username}</td>
                  <td
                    className="clickable-address"
                    onClick={() =>
                      handleShowMap(
                        order.customer_latitude,
                        order.customer_longitude,
                        order.customer_address
                      )
                    }
                  >
                    {order.customer_address}
                  </td>
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
                      {t("DeliverOrder.finish")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>{t("DeliverOrder.noOrders")}</p>
        )}

        {notification.message && (
          <NotificationPopup
            message={notification.message}
            type={notification.type}
          />
        )}

        {isPopupOpen && mapCoordinates && (
          <div className="modal-overlay">
            <div className="modal-content">
              <span className="close-popup" onClick={handleClosePopup}>
                &times;
              </span>
              <Map
                latitude={mapCoordinates.latitude}
                longitude={mapCoordinates.longitude}
                address={mapCoordinates.address}
              />
            </div>
          </div>
        )}

        {isPopupOpen && popupContent && (
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
