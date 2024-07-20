import React from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import './Auth.css';

function LoginPopup({ closeLoginModal, switchToRegister }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={closeLoginModal}>&times;</span>
        <FaExchangeAlt className="switch-icon" onClick={switchToRegister} />
        <h2>Login</h2>
        <form>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" required />
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPopup;
