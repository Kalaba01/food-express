import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';
import { FaExchangeAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function LoginPopup({ closeLoginModal, switchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post('http://localhost:8000/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const token = response.data.access_token;
      const userResponse = await axios.get('http://localhost:8000/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userRole = userResponse.data.role;
      if (userRole === 'customer') {
        navigate('/customer');
      } else if (userRole === 'owner') {
        navigate('/owner');
      } else if (userRole === 'courier') {
        navigate('/courier');
      } else if (userRole === 'administrator') {
        navigate('/admin');
      }

      closeLoginModal();
    } catch (error) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={closeLoginModal}>&times;</span>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <div className="switch-register">
          <FaExchangeAlt onClick={switchToRegister} className="switch-icon" />
          <p onClick={switchToRegister}>Don't have an account? Register</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPopup;
