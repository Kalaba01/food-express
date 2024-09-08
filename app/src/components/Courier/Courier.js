import React from 'react';
import { Header, CourierStatistic } from '../index';

function Courier({ darkMode, toggleDarkMode }) {
  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="courier" />
      <h2>Courier Dashboard</h2>
      <CourierStatistic />
    </div>
  );
}

export default Courier;
