import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import "./HamburgerMenu.css";

function HamburgerMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

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
            <a href="/admin/requests">Requests</a>
            <a href="/admin/users">Users</a>
            <a href="/admin/delivery-zones">Delivery Zones</a>
            <a href="/admin/restaurants">Restaurants</a>
          </>
        );
      case 'customer':
        return (
          <>
            <a href="/customer/route1">Item 1</a>
            <a href="/customer/route2">Item 2</a>
          </>
        );
      case 'owner':
        return (
          <>
            <a href="/owner/route1">Item 1</a>
            <a href="/owner/route2">Item 2</a>
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
