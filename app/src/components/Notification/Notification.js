import React, { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import moment from "moment";
import "./Notification.css";

function Notification() {
  const { t } = useTranslation('global');
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error(t('Notification.tokenNotFound'));
      return;
    }

    let userId;
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id;
    } catch (error) {
      console.error(t('Notification.invalidToken'), error);
      return;
    }

    const ws = new WebSocket(`ws://localhost:8000/ws/notifications/${userId}`);

    ws.onopen = () => {
      console.log(t('Notification.connectionEstablished'));

      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);

      ws.onclose = () => {
        clearInterval(pingInterval);
      };
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setNotifications(data.notifications);
      const unreadNotifications = data.notifications.filter(
        (notification) => !notification.read
      );
      setUnreadCount(unreadNotifications.length);
      setHasUnread(unreadNotifications.length > 0);
    };

    return () => {
      ws.close();
    };
  }, [t]);

  const markAsRead = async (id) => {
    const notification = notifications.find((n) => n.id === id);
  
    if (notification && notification.read) {
      return;
    }
  
    try {
      await axios.put(`http://localhost:8000/notifications/${id}/read`);
  
      setNotifications((prevNotifications) => {
        const updatedNotifications = prevNotifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
  
        const unreadNotifications = updatedNotifications.filter((n) => !n.read);
        setUnreadCount(unreadNotifications.length);
        setHasUnread(unreadNotifications.length > 0);
  
        return updatedNotifications;
      });
    } catch (error) {
      console.error(t('Notification.markAsReadError'), error);
    }
  };  

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <div className="notification-container">
      <div className="icon-container" onClick={togglePopup}>
        <FaBell className="notification-icon" />
        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>
      {isPopupOpen && (
        <div className="notification-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  notification.read ? "" : "unread"
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="notification-message">
                  <p>{notification.message}</p>
                  <span className="timestamp">
                    {moment(notification.created_at).fromNow()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-notifications">{t('Notification.noNotifications')}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Notification;
