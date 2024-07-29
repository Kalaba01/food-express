import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    if (!allowedRoles.includes(decodedToken.role)) {
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    console.error('Invalid token:', error);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
