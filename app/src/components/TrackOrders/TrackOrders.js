import React, { useState, useEffect } from "react";
import { Header, Rating } from "../index";
import axios from "axios";
import "./TrackOrders.css";

function TrackOrders({ darkMode, toggleDarkMode }) {
  const [orders, setOrders] = useState([]);
  const [statusTitle, setStatusTitle] = useState("Status");
  const [showRating, setShowRating] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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
              setStatusTitle("Preparing");
            } else if (firstOrder.statusColumn === "Delivering") {
              setStatusTitle("Delivery");
            } else {
              setStatusTitle("Status");
            }
          }
        } else {
          console.error("No token found");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
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

  const handleFinish = (orderId) => {
    setSelectedOrderId(orderId);
    setShowRating(true);
  };

  const handleCloseRating = () => {
    setShowRating(false); // Zatvori Rating popup
  };

  const getStatusColumn = (order) => {
    if (order.statusColumn === "Waiting") {
      return <span className="status waiting">Waiting</span>;
    } else if (order.statusColumn === "Preparing") {
      const preparationTime = new Date(order.timeValue);
      const timeLeftInMinutes = order.remainingTime
        ? Math.ceil(order.remainingTime / 60)
        : 0;
      return <span className="status preparing">{timeLeftInMinutes} min</span>;
    } else if (order.statusColumn === "Delivering") {
      const deliveryTime = new Date(order.timeValue);
      const timeLeftInMinutes = order.remainingTime
        ? Math.ceil(order.remainingTime / 60)
        : 0;
      return <span className="status delivering">{timeLeftInMinutes} min</span>;
    }
    return null;
  };

  return (
    <>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="customer"
      />
      <div className="track-orders">
        <h2>Track Orders</h2>
        <table>
          <thead>
            <tr>
              <th>Courier</th>
              <th>Restaurant</th>
              <th>Address</th>
              <th>Contact</th>
              <th>Price</th>
              <th>Payment</th>
              <th>{statusTitle}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.courierUsername || "Not assigned"}</td>
                <td>{order.restaurantName || "N/A"}</td>
                <td>{order.restaurantAddress || "N/A"}</td>
                <td>{order.restaurantContact || "N/A"}</td>
                <td>{order.price} BAM</td>
                <td>{order.paymentMethod}</td>
                <td>{getStatusColumn(order)}</td>
                <td>
                  <button
                    onClick={() => handleFinish(order.id)}
                    className="finish-btn"
                  >
                    Finish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showRating && <Rating orderId={selectedOrderId} onClose={handleCloseRating} />}
    </>
  );
}

export default TrackOrders;
