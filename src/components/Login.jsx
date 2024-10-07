import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import '../styles/Login.css';
import logoSrc from '/rcnnct.png';

/**
 * Login component for kiosk login
 */
const Login = () => {
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAppContext();

  /**
   * Handle form submission for login
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login with user ID:', userId);
      const response = await apiService.kioskLogin(userId);
      setUser(response);
      const from = location.state?.from || '/';
      console.log('Login successful, navigating to:', from);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      alert('Invalid ID. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <BackgroundLogos logoSrc={logoSrc} />
      <div className="card login-card">
        <h2>Kiosk Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your ID or scan barcode"
            required
          />
          <Button type="submit">Login</Button>
        </form>
      </div>
    </div>
  );
};

export default Login;