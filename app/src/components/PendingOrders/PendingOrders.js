import React, { useState, useEffect } from 'react';
import { Header } from "../index";
import axios from 'axios';
import './PendingOrders.css';

function PendingOrders({ darkMode, toggleDarkMode, openPopupModal, userType }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:8000/owner/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch pending orders', error);
      }
    };

    fetchPendingOrders();
  }, []);

  const handleAccept = async (orderId) => {
    try {
      await axios.put(`http://localhost:8000/owner/orders/${orderId}/update`, { status: 'preparing' });
      setOrders(orders.filter(order => order.order_id !== orderId));
    } catch (error) {
      console.error('Failed to accept order', error);
    }
  };

  const handleDeny = async (orderId) => {
    try {
      await axios.put(`http://localhost:8000/owner/orders/${orderId}/update`, { status: 'cancelled' });
      setOrders(orders.filter(order => order.order_id !== orderId));
    } catch (error) {
      console.error('Failed to deny order', error);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const closePopup = () => {
    setSelectedOrder(null);
  };

  return (
    <>
      <Header 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        openPopupModal={openPopupModal} 
        userType={userType} 
      />
      <div className={`pending-orders-container ${darkMode ? 'dark-mode' : ''}`}>
        <h2>Pending Orders</h2>
        <div className="order-table">
          <div className="order-row order-header">
            <div>Name</div>
            <div>Price</div>
            <div>Address</div>
            <div>Cutlery</div>
            <div>Actions</div>
          </div>
          {orders.length > 0 ? (
            orders.map(order => (
              <div key={order.order_id} className="order-row" onClick={() => handleOrderClick(order)}>
                <div>{order.customer_name}</div>
                <div>{order.total_price} BAM</div>
                <div>{order.delivery_address}</div>
                <div>{order.cutlery_included !== null && order.cutlery_included !== undefined ? (order.cutlery_included ? 'Yes' : 'No') : 'No'}</div>
                <div className="order-actions">
                  <button className="accept-button" onClick={() => handleAccept(order.order_id)}>Accept</button>
                  <button className="deny-button" onClick={() => handleDeny(order.order_id)}>Deny</button>
                </div>
              </div>
            ))
          ) : (
            <p>No orders requiring your response at the moment.</p>
          )}
        </div>
        {selectedOrder && (
          <div className="order-popup">
            <h3>Order Details</h3>
            <div className="order-item-header">
              <div>Name</div>
              <div>Description</div>
              <div>Price</div>
              <div>Category</div>
            </div>
            {selectedOrder.items.map((item, index) => (
              <div key={index} className="order-item">
                <div>{item.name}</div>
                <div>{item.description}</div>
                <div>{item.price} BAM</div>
                <div>{item.category}</div>
              </div>
            ))}
            <button onClick={closePopup}>Close</button>
          </div>
        )}
      </div>
    </>
  );
}

export default PendingOrders;
