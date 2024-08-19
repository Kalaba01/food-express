import React from "react";
import { Header, SearchBar } from "../index";

function Customer({ darkMode, toggleDarkMode }) {
  return (
    <div>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="customer"
      />
      <div className="customer-dashboard">
        <h1>Welcome to Food Express</h1>
        <SearchBar />
      </div>
    </div>
  );
}

export default Customer;
