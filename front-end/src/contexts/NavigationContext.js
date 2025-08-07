import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Create the context
const NavigationContext = createContext();

// Custom hook to use the navigation context
export const useNavigation = () => useContext(NavigationContext);

// Provider component
export const NavigationProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Update history when location changes and reset scroll position
  useEffect(() => {
    // Don't add duplicate entries for the same path
    if (history.length === 0 || history[history.length - 1] !== location.pathname) {
      setHistory(prev => [...prev, location.pathname]);
      // Reset scroll position to top when navigating to a new page
      window.scrollTo(0, 0);
    }
  }, [location.pathname, history]);

  // Go back to the previous page
  const goBack = () => {
    if (history.length > 1) {
      // Remove current page from history
      const newHistory = [...history];
      newHistory.pop();
      
      // Navigate to previous page
      const previousPage = newHistory[newHistory.length - 1];
      navigate(previousPage);
      
      // Update history
      setHistory(newHistory);
    } else {
      // If no history, go to home
      navigate('/');
    }
  };

  // Check if we can go back
  const canGoBack = history.length > 1;

  return (
    <NavigationContext.Provider value={{ history, goBack, canGoBack }}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationContext;