import React, { useState, useEffect, useContext } from 'react';
import { Header, Order } from "../index";
import { jwtDecode } from 'jwt-decode';
import { BasketContext } from '../../BasketContext';
import axios from 'axios';
import './OrderHistory.css';

function OrderHistory({ darkMode, toggleDarkMode }) {
  const [orders, setOrders] = useState([]);
  const { setBasket, basket } = useContext(BasketContext);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isOrderPopupOpen, setIsOrderPopupOpen] = useState(false);

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

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedOrderItems([]);
  };

  const handleCloseOrderPopup = () => {
    setIsOrderPopupOpen(false);
  };

  return (
    <>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="customer"
      />
      <div className="order-history">
        <h2>Your Order History</h2>
        {orders.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Restaurant</th>
                <th>Category</th>
                <th>Contact</th>
                <th>Total Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.restaurant_name}</td>
                  <td>{order.restaurant_category}</td>
                  <td>{order.restaurant_contact}</td>
                  <td 
                    className="clickable-price"
                    onClick={() => handleShowItems(order.items)}
                  >
                    {order.total_price} BAM
                  </td>
                  <td>
                    <button onClick={() => handleOrderAgain(order)}>Order Again</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No orders found.</p>
        )}
      </div>

      {isPopupOpen && (
        <div className="order-items-popup">
          <div className="popup-content">
            <span className="close-popup" onClick={handleClosePopup}>&times;</span>
            <h3>Order Items</h3>
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

      {isOrderPopupOpen && <Order onClose={handleCloseOrderPopup} />}
    </>
  );
}

export default OrderHistory;
