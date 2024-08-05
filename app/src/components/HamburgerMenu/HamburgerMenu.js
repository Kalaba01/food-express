import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import "./HamburgerMenu.css";

function HamburgerMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <div className="hamburger-menu" onClick={toggleMenu}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>
      <div className={`sidebar ${menuOpen ? "open" : ""}`}>
        <a href="/route1">Item 1</a>
        <a href="/route2">Item 2</a>
        <a href="/route3">Item 3</a>
        <a href="/route4">Item 4</a>
      </div>
    </>
  );
}

export default HamburgerMenu;
