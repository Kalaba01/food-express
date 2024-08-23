import React, { useState, useEffect } from 'react';
import { Header } from "../index";
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './PendingOrders.css';

function PendingOrders({ darkMode, toggleDarkMode, openPopupModal, userType }) {
  const { t } = useTranslation('global');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchPendingOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:8000/owner/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error(t('PendingOrders.fetchError'), error);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const handleAccept = async (orderId, e) => {
    e.stopPropagation();
    try {
        await axios.put(`http://localhost:8000/owner/orders/${orderId}/update`, null, {
            params: { status: 'preparing' },
        });
        fetchPendingOrders();
    } catch (error) {
        console.error(t('PendingOrders.acceptError'), error);
    }
  };

  const handleDeny = async (orderId, e) => {
    e.stopPropagation();
    try {
        await axios.put(`http://localhost:8000/owner/orders/${orderId}/update`, null, {
            params: { status: 'cancelled' },
        });
        fetchPendingOrders();
    } catch (error) {
        console.error(t('PendingOrders.denyError'), error);
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
        <h2>{t('PendingOrders.title')}</h2>
        <div className="order-table">
          <div className="order-row order-header">
            <div>{t('PendingOrders.name')}</div>
            <div>{t('PendingOrders.price')}</div>
            <div>{t('PendingOrders.address')}</div>
            <div>{t('PendingOrders.cutlery')}</div>
            <div>{t('PendingOrders.actions')}</div>
          </div>
          {orders.length > 0 ? (
            orders.map(order => (
              <div key={order.order_id} className="order-row" onClick={() => handleOrderClick(order)}>
                <div>{order.customer_name}</div>
                <div>{order.total_price} BAM</div>
                <div>{order.delivery_address}</div>
                <div>{order.cutlery_included !== null && order.cutlery_included !== undefined ? (order.cutlery_included ? t('PendingOrders.yes') : t('PendingOrders.no')) : t('PendingOrders.no')}</div>
                <div className="order-actions">
                  <button className="accept-button" onClick={(e) => handleAccept(order.order_id, e)}>{t('PendingOrders.accept')}</button>
                  <button className="deny-button" onClick={(e) => handleDeny(order.order_id, e)}>{t('PendingOrders.deny')}</button>
                </div>
              </div>
            ))
          ) : (
            <p>{t('PendingOrders.noOrders')}</p>
          )}
        </div>
        {selectedOrder && (
          <div key={selectedOrder.order_id} className="order-popup">
            <h3>{t('PendingOrders.details')}</h3>
            <div className="order-item-header">
              <div>{t('PendingOrders.name')}</div>
              <div>{t('PendingOrders.description')}</div>
              <div>{t('PendingOrders.price')}</div>
              <div>{t('PendingOrders.quantity')}</div>
              <div>{t('PendingOrders.category')}</div>
            </div>
            {selectedOrder.items.map((item, index) => (
              <div key={index} className="order-item">
                <div>{item.name}</div>
                <div>{item.description}</div>
                <div>{item.price} BAM</div>
                <div>{item.quantity}</div>
                <div>{item.category}</div>
              </div>
            ))}
            <button onClick={closePopup}>{t('PendingOrders.close')}</button>
          </div>
        )}
      </div>
    </>
  );
}

export default PendingOrders;
