import React from "react";
import { Header, SearchBar, TopRestaurants } from "../index";
import { useTranslation } from 'react-i18next';
import { ReactTyped } from "react-typed";

function Customer({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation('global');

  return (
    <div>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="customer"
      />
      <div className="customer-dashboard">
        <h1>
        <ReactTyped 
          strings={[`${t('Customer.header')}`]}
          typeSpeed={50}
          loop={false}
        />
        </h1>
        <SearchBar />
        <TopRestaurants />
      </div>
    </div>
  );
}

export default Customer;
