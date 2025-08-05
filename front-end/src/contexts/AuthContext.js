import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../network/userApi.ts';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await getCurrentUser(token);
          setCurrentUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAuthenticated, 
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;