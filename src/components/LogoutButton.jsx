import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import Button from './Button';

const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAppContext();

  const handleLogout = async () => {
    try {
      await apiService.logout();
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Button onClick={handleLogout} className="logout-button">Logout</Button>
  );
};

export default LogoutButton;