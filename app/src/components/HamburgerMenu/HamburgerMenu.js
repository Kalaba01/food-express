import React, { useState, useEffect } from "react";
import { FaBars, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "./HamburgerMenu.css";

function HamburgerMenu() {
  const { t } = useTranslation("global");
  const [menuOpen, setMenuOpen] = useState(false);
  const [restaurantsOpen, setRestaurantsOpen] = useState(false);
  const [restaurants, setRestaurants] = useState([]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleRestaurants = () => {
    setRestaurantsOpen(!restaurantsOpen);
  };

  const token = localStorage.getItem("token");
  let userRole = "";

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp > currentTime) {
        userRole = decodedToken.role;
      } else {
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Invalid token", error);
      localStorage.removeItem("token");
    }
  }

  useEffect(() => {
    if (userRole === "owner") {
      const fetchRestaurants = async () => {
        try {
          const response = await axios.get(
            "http://localhost:8000/owner/restaurants",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setRestaurants(response.data);
        } catch (error) {
          console.error("Error fetching restaurants:", error);
        }
      };

      fetchRestaurants();
    }
  }, [userRole, token]);

  const menuItems = () => {
    switch (userRole) {
      case "administrator":
        return (
          <>
            <a href="/admin/requests">{t("HamburgerMenu.admin.requests")}</a>
            <a href="/admin/users">{t("HamburgerMenu.admin.users")}</a>
            <a href="/admin/delivery-zones">{t("HamburgerMenu.admin.deliveryZones")}</a>
            <a href="/admin/restaurants">{t("HamburgerMenu.admin.restaurants")}</a>
            <a href="/admin/orders">{t("HamburgerMenu.admin.orders")}</a>
            <a href="/admin/couriers">{t("HamburgerMenu.admin.couriers")}</a>
          </>
        );
      case "customer":
        return (
          <>
             <a href="/customer/track-orders">Track Orders</a>
             <a href="/customer/order-history">Order History</a>
          </>
        );
      case "owner":
        return (
          <>
            <div className="hamburger-restaurants-dropdown">
              <button className="hamburger-restaurants-button" onClick={toggleRestaurants}>
                {t("HamburgerMenu.owner.restaurants")}
                {restaurantsOpen ? <FaChevronUp className="arrow-icon" /> : <FaChevronDown className="arrow-icon" />}
              </button>
              <div className={`hamburger-restaurants-content ${restaurantsOpen ? "open" : ""}`}>
                {restaurants.length > 0 ? (
                  restaurants.map((restaurant) => (
                    <a
                      key={restaurant.id}
                      href={`/owner/restaurant/${restaurant.id}`}
                    >
                      {restaurant.name}
                    </a>
                  ))
                ) : (
                  <span className="hamburger-no-restaurants">
                    {t("HamburgerMenu.owner.noRestaurants")}
                  </span>
                )}
              </div>
            </div>
            <a href="/owner/orders">{t("HamburgerMenu.owner.pendingOrders")}</a>
          </>
        );
      case "courier":
        return (
          <>
            <a href="/courier/deliver-order">Deliver Order</a>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="hamburger-menu" onClick={toggleMenu}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>
      <div className={`sidebar ${menuOpen ? "open" : ""}`}>{menuItems()}</div>
    </>
  );
}

export default HamburgerMenu;
