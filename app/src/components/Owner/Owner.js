import React from 'react';
import { Header, OwnerStatistic } from '../index';

function Owner({ darkMode, toggleDarkMode }) {
  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="owner" />
      <h2>Owner Dashboard</h2>
      <OwnerStatistic />
    </div>
  );
}

export default Owner;
