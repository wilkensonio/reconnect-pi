import React, { createContext, useContext, useState } from 'react';

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

  const value = {
    user,
    setUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};