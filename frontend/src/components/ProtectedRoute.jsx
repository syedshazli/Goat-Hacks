import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { jwtToken } = useContext(AuthContext);

  if (!jwtToken) {
    // If no token, redirect to /login
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render page
  return children;
};

export default ProtectedRoute;
