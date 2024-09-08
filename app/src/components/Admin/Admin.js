import React from 'react';
import { Header, AdminStatistic } from '../index';
import { ReactTyped } from "react-typed";

function Admin({ darkMode, toggleDarkMode }) {
  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="administrator" />
      <h2>
      <ReactTyped 
          strings={["Admin Dashboard"]}
          typeSpeed={50}
          loop={false}
        />
      </h2>
      <AdminStatistic />
    </div>
  );
}

export default Admin;
