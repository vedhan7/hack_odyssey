import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Route Guard Component
 * Checks localStorage for a valid session.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();

  const sessionStr = localStorage.getItem('certchain_session');
  const session = sessionStr ? JSON.parse(sessionStr) : null;

  if (!session || !session.loggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && session.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
