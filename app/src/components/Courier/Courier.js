import React from 'react';
import { Header, CourierStatistic } from '../index';
import { ReactTyped } from "react-typed";

function Courier({ darkMode, toggleDarkMode }) {
  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="courier" />
      <h2>
      <ReactTyped 
          strings={["Courier Dashboard"]}
          typeSpeed={50}
          loop={false}
        />
      </h2>
      <CourierStatistic />
    </div>
  );
}

export default Courier;
