import React, { useState } from 'react';
import axios from 'axios';
import { FaExchangeAlt } from 'react-icons/fa';
import './Auth.css';

function RegisterPopup({ closeRegisterModal, switchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/register', formData);
      if (response.status === 200) {
        console.log('Registration successful');
        closeRegisterModal();
      } else {
        console.error('Registration failed');
      }
    } catch (error) {
      console.error('An error occurred during registration', error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={closeRegisterModal}>&times;</span>
        <FaExchangeAlt className="switch-icon" onClick={switchToLogin} />
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPopup;
