import React from 'react';
import './NotificationPopup.css';

const NotificationPopup = ({ message, type }) => {
  return (
    <div className={`notification-popup ${type}`}>
      <p>{message}</p>
    </div>
  );
};

export default NotificationPopup;
