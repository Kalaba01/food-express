import React, { useState, useEffect, useContext } from 'react';
import { Header, Order, Map } from "../index";  // Dodali smo Map komponentu
import { jwtDecode } from 'jwt-decode';
import { BasketContext } from '../../BasketContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './OrderHistory.css';

function OrderHistory({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation("global");
  const [orders, setOrders] = useState([]);
  const { setBasket, basket } = useContext(BasketContext);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isOrderPopupOpen, setIsOrderPopupOpen] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState(null); // Dodali smo stanje za mapu

  useEffect(() => {
    const fetchOrderHistory = async () => {
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      const customerId = decodedToken ? decodedToken.id : null;

      try {
        const response = await axios.get(`http://localhost:8000/order-history/?customer_id=${customerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching order history:', error);
      }
    };

    fetchOrderHistory();
  }, []);

  const handleOrderAgain = (order) => {
    const basketItems = order.items.map(item => ({
      id: item.item_id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      category: item.category,
      restaurant_id: order.restaurant_id
    }));
    setBasket(basketItems);
    setIsOrderPopupOpen(true);
  };

  const handleShowItems = (items) => {
    setSelectedOrderItems(items);
    setIsPopupOpen(true);
  };

  const handleOpenMap = (latitude, longitude, address) => {
    setMapCoordinates({ latitude, longitude, address });
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedOrderItems([]);
  };

  const handleCloseOrderPopup = () => {
    setIsOrderPopupOpen(false);
  };

  const handleCloseMap = () => {
    setMapCoordinates(null);
  };

  return (
    <>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="customer"
      />
      <div className="order-history">
        <h2>{t("OrderHistory.title")}</h2>
        {orders.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>{t("OrderHistory.restaurant")}</th>
                <th>{t("OrderHistory.category")}</th>
                <th>{t("OrderHistory.contact")}</th>
                <th>{t("OrderHistory.totalPrice")}</th>
                <th>{t("OrderHistory.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td
                    className="clickable-restaurant-name"
                    onClick={() => handleOpenMap(order.latitude, order.longitude, order.restaurant_name)}
                  >
                    {order.restaurant_name}
                  </td>
                  <td>{order.restaurant_category}</td>
                  <td>{order.restaurant_contact}</td>
                  <td 
                    className="clickable-price"
                    onClick={() => handleShowItems(order.items)}
                  >
                    {order.total_price} BAM
                  </td>
                  <td>
                    <button onClick={() => handleOrderAgain(order)}>{t("OrderHistory.orderAgain")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>{t("OrderHistory.noOrders")}</p>
        )}
      </div>

      {isPopupOpen && (
        <div className="order-items-popup">
          <div className="popup-content">
            <span className="close-popup" onClick={handleClosePopup}>&times;</span>
            <h3>{t("OrderHistory.orderItems")}</h3>
            <ul>
              {selectedOrderItems.map((item, index) => (
                <li key={index}>
                  {item.name} - {item.quantity} x {item.price} BAM
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {mapCoordinates && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-popup" onClick={handleCloseMap}>
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

      {isOrderPopupOpen && <Order onClose={handleCloseOrderPopup} />}
    </>
  );
}

export default OrderHistory;
