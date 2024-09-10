import React, { useState, useEffect } from "react";
import { Header, Rating, NotificationPopup, Map, Loading } from "../index";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "./TrackOrders.css";

function TrackOrders({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation('global');
  const [orders, setOrders] = useState([]);
  const [statusTitle, setStatusTitle] = useState(t("TrackOrders.status"));
  const [showRating, setShowRating] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get(
            "http://localhost:8000/customer/track-orders",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const currentTime = new Date();
          const updatedOrders = response.data.map((order) => {
            if (
              order.statusColumn === "Preparing" ||
              order.statusColumn === "Delivering"
            ) {
              const timeValue = new Date(order.timeValue);
              const remainingTime = Math.max(
                Math.ceil((timeValue - currentTime) / 60000),
                0
              );

              return {
                ...order,
                remainingTime: remainingTime > 0 ? remainingTime * 60 : 0,
              };
            }
            return order;
          });

          setOrders(updatedOrders);

          if (response.data.length > 0) {
            const firstOrder = response.data[0];
            if (firstOrder.statusColumn === "Preparing") {
              setStatusTitle(t("TrackOrders.preparing"));
            } else if (firstOrder.statusColumn === "Delivering") {
              setStatusTitle(t("TrackOrders.delivering"));
            } else {
              setStatusTitle(t("TrackOrders.status"));
            }
          }
        } else {
          console.error("No token found");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (
            order.statusColumn === "Preparing" ||
            order.statusColumn === "Delivering"
          ) {
            const currentTime = new Date();
            const timeValue = new Date(order.timeValue);
            const remainingTime = Math.max(
              Math.ceil((timeValue - currentTime) / 60000),
              0
            );
  
            return {
              ...order,
              remainingTime: remainingTime > 0 ? remainingTime * 60 : 0,
            };
          }
          return order;
        })
      );
    }, 60000);
  
    return () => clearInterval(intervalId);
  }, [orders]);  

  const handleOpenMap = (latitude, longitude, address) => {
    setMapCoordinates({ latitude, longitude, address });
  };

  const handleCloseMap = () => {
    setMapCoordinates(null);
  };

  const handleFinish = (orderId, courierUsername) => {
    if (!courierUsername) {
      setNotification({
        message: t("TrackOrders.noCourierAssigned"),
        type: "error",
      });
    } else {
      setSelectedOrderId(orderId);
      setShowRating(true);
    }
  };  

  const handleCloseRating = () => {
    setShowRating(false);
    setNotification({
      message: t("Rating.successMessage"),
      type: "success",
    });
  };

  const getStatusColumn = (order) => {
    if (order.statusColumn === "Waiting") {
      return <span className="status waiting">{t("TrackOrders.waiting")}</span>;
    } else if (order.statusColumn === "Preparing") {
      const timeLeftInMinutes = order.remainingTime
        ? Math.ceil(order.remainingTime / 60)
        : 0;
      return <span className="status preparing">{`${timeLeftInMinutes} ${t("TrackOrders.minutes")}`}</span>;
    } else if (order.statusColumn === "Delivering") {
      const timeLeftInMinutes = order.remainingTime
        ? Math.ceil(order.remainingTime / 60)
        : 0;
      return <span className="status delivering">{`${timeLeftInMinutes} ${t("TrackOrders.minutes")}`}</span>;
    }
    return null;
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

  if(!(orders.length > 0)) {
    return(
      <>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="customer"
      />
      <p>{t("TrackOrders.noOrders")}</p>
      </>
    )
  }

  return (
    <>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="customer"
      />
      <div className="track-orders">
        <h2>{t("TrackOrders.trackOrders")}</h2>
        <table>
          <thead>
            <tr>
              <th>{t("TrackOrders.courier")}</th>
              <th>{t("TrackOrders.restaurant")}</th>
              <th>{t("TrackOrders.address")}</th>
              <th>{t("TrackOrders.contact")}</th>
              <th>{t("TrackOrders.price")}</th>
              <th>{t("TrackOrders.payment")}</th>
              <th>{statusTitle}</th>
              <th>{t("TrackOrders.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.courierUsername || t("TrackOrders.notAssigned")}</td>
                <td>{order.restaurantName || "N/A"}</td>
                <td
                  className="clickable-address"
                  onClick={() => handleOpenMap(order.latitude, order.longitude, order.restaurantAddress)}
                >
                  {order.restaurantAddress || "N/A"}
                </td>
                <td>{order.restaurantContact || "N/A"}</td>
                <td>{order.price} BAM</td>
                <td>{order.paymentMethod}</td>
                <td>{getStatusColumn(order)}</td>
                <td>
                  <button
                    onClick={() => handleFinish(order.id, order.courierUsername)}
                    className="finish-btn"
                  >
                    {t("TrackOrders.finish")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

      {showRating && <Rating orderId={selectedOrderId} onClose={handleCloseRating} />}
      {notification.message && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
        />
      )}
    </>
  );
}

export default TrackOrders;
