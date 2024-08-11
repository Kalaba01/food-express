import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import "./HamburgerMenu.css";

function HamburgerMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation("global");

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const token = localStorage.getItem('token');
  let userRole = '';

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp > currentTime) {
        userRole = decodedToken.role;
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error("Invalid token", error);
      localStorage.removeItem('token');
    }
  }

  const menuItems = () => {
    switch (userRole) {
      case 'administrator':
        return (
          <>
            <a href="/admin/requests">{t('HamburgerMenu.admin.requests')}</a>
            <a href="/admin/users">{t('HamburgerMenu.admin.users')}</a>
            <a href="/admin/delivery-zones">{t('HamburgerMenu.admin.deliveryZones')}</a>
            <a href="/admin/restaurants">{t('HamburgerMenu.admin.restaurants')}</a>
          </>
        );
      case 'customer':
        return (
          <>
            <a href="/courier/route1">Item 1</a>
            <a href="/courier/route2">Item 2</a>
          </>
        );
      case 'owner':
        return (
          <>
            <a href="/courier/route1">Item 1</a>
            <a href="/courier/route2">Item 2</a>
          </>
        );
      case 'courier':
        return (
          <>
            <a href="/courier/route1">Item 1</a>
            <a href="/courier/route2">Item 2</a>
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
      <div className={`sidebar ${menuOpen ? "open" : ""}`}>
        {menuItems()}
      </div>
    </>
  );
}

export default HamburgerMenu;
