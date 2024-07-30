import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import './Logout.css';

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="logout" onClick={handleLogout}>
      <FaSignOutAlt className="icon" title="Logout" />
    </div>
  );
}

export default Logout;
