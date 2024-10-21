import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import '../styles/Login.css';
import logoSrc from '/rcnnct.png';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Attempting login with user ID:', userId);
      const response = await apiService.kioskLogin(userId);
      console.log('Login successful, response:', response);
      
      // Store the token
      localStorage.setItem('reconnect_access_token', response.access_token);
      
      // Set user in context
      setUser({
        id: response.id,
        student_id: response.student_id,
        first_name: response.first_name,
        last_name: response.last_name,
        email: response.email,
      });

      const from = location.state?.from || '/';
      console.log('Navigating to:', from);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. This might be due to a CORS policy issue or mixed content restrictions. Please check your network connection and try again.';
      } else if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Access forbidden. Please check your credentials or contact the system administrator.';
        } else {
          errorMessage = `Server responded with error ${error.response.status}: ${error.response.data.detail || error.response.statusText}`;
        }
      }
      setError(errorMessage);
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
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default Login;