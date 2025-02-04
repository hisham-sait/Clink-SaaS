import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Log route access attempts for debugging
    if (!user && !loading) {
      console.log('Unauthorized access attempt:', location.pathname);
    }
  }, [user, loading, location]);

  if (loading) {
    return <div className="loading-spinner" />;
  }

  if (!user) {
    // Redirect to login page but save the attempted url
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
