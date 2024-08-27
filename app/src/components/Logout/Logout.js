import React from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';
import './Logout.css';

function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem('token');

    if (token) {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;
      const userRole = decodedToken.role;

      if (userRole === 'courier') {
        try {
          const response = await axios.put(
            'http://localhost:8000/courier/status',
            { id: userId, status: 'offline' },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          console.log("Response from server:", response.data);
        } catch (error) {
          console.error('Failed to update courier status:', error.response?.data || error.message);
        }
      }

      localStorage.removeItem('token');
      navigate('/');
    }
  };

  return (
    <div className="logout" onClick={handleLogout}>
      <FaSignOutAlt className="icon" title="Logout" />
    </div>
  );
}

export default Logout;
