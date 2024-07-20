import React from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import './Auth.css';

function RegisterPopup({ closeRegisterModal, switchToLogin }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={closeRegisterModal}>&times;</span>
        <FaExchangeAlt className="switch-icon" onClick={switchToLogin} />
        <h2>Register</h2>
        <form>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" required />
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPopup;
