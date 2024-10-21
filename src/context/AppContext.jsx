import React, { createContext, useContext, useState } from 'react';
import { apiService } from '../services/api';

const AppContext = createContext();

/**
 * Custom hook to use the AppContext
 * @returns {Object} The context value
 */
export const useAppContext = () => useContext(AppContext);

/**
 * AppProvider component for global state management
 * @param {Object} props - The component props
 * @param {React.ReactNode} props.children - The child components
 */
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  /**
   * Logout function to clear user data and token
   */
  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value = {
    user,
    setUser,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};