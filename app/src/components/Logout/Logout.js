import React, { useState } from "react";
import { NotificationPopup } from "../index";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";
import { FaSignOutAlt } from "react-icons/fa";
import axios from "axios";
import "./Logout.css";

function Logout() {
  const navigate = useNavigate();
  const { t } = useTranslation("global");
  const [notification, setNotification] = useState({ message: "", type: "" });

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;
      const userRole = decodedToken.role;

      if (userRole === "courier") {
        try {
          const checkResponse = await axios.get(
            `http://localhost:8000/courier/${userId}/has-unfinished-orders`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (checkResponse.data.has_unfinished_orders) {
            setNotification({
              message: t("Logout.cannotLogoutPendingOrders"),
              type: "error",
            });
          } else {
            await axios.put(
              "http://localhost:8000/courier/status",
              { id: userId, status: "offline" },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            localStorage.removeItem("token");
            navigate("/");
          }
        } catch (error) {
          console.error(
            "Failed to update courier status:",
            error.response?.data || error.message
          );
        }
      } else {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  return (
    <div className="logout" onClick={handleLogout}>
      <FaSignOutAlt className="icon" title={t("Logout.logout")} />
      {notification.message && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
        />
      )}
    </div>
  );
}

export default Logout;
