import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(true);

  // If still loading auth state, show nothing or a loading spinner
  if (loading) {
    return <div>Loading...</div>;
  }

  // If authenticated, render the protected component
  if (isAuthenticated) {
    return children;
  }

  // If not authenticated, show login modal
  if (showLoginModal) {
    return (
      <>
        {/* Render a dimmed version of the protected content in the background */}
        <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
          {children}
        </div>
        
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          redirectPath={location.pathname}
        />
      </>
    );
  }

  // If modal is closed, redirect to home page
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;