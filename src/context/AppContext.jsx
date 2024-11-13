import React, { createContext, useContext, useState } from 'react';
import { apiService } from '../services/api';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(() => {
    // Initialize from sessionStorage if available
    const storedFacultyId = sessionStorage.getItem('selected_faculty_id');
    return storedFacultyId ? { id: storedFacultyId } : null;
  });

  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      // Clear faculty selection on logout
      sessionStorage.removeItem('selected_faculty_id');
      setSelectedFaculty(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  

  const selectFaculty = (facultyId) => {
    sessionStorage.setItem('selected_faculty_id', facultyId);
    setSelectedFaculty({ id: facultyId });
  };

  const value = {
    user,
    setUser,
    logout,
    selectedFaculty,
    selectFaculty
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};