import React from 'react';
import { Header, OwnerStatistic } from '../index';
import { ReactTyped } from "react-typed";

function Owner({ darkMode, toggleDarkMode }) {
  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="owner" />
      <h2>
      <ReactTyped 
          strings={["Owner Dashboard"]}
          typeSpeed={50}
          loop={false}
        />
      </h2>
      <OwnerStatistic />
    </div>
  );
}

export default Owner;
