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
  const selectedFacultyId = sessionStorage.getItem('selected_faculty_id');

  React.useEffect(() => {
    if (!selectedFacultyId) {
      navigate('/', { replace: true });
    }
  }, [selectedFacultyId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await apiService.kioskLogin(userId);
      localStorage.setItem('reconnect_access_token', response.access_token);
      
      setUser({
        id: response.id,
        student_id: response.student_id,
        first_name: response.first_name,
        last_name: response.last_name,
        email: response.email,
      });

      navigate('/home', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Access forbidden. Please check your credentials.';
        } else {
          errorMessage = error.response.data.detail || error.response.statusText;
        }
      }
      setError(errorMessage);
    }
  };

  const handleBackToFaculty = () => {
    sessionStorage.removeItem('selected_faculty_id');
    navigate('/', { replace: true });
  };

  return (
    <div className="login-container">
      <BackgroundLogos logoSrc={logoSrc} />
      <div className="login-container-inner">
        <div className="login-card">
          <h2>Student Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your Student ID or scan barcode"
                required
                className="login-input"
              />
            </div>
            <div className="button-group">
              <Button type="submit" className="login-button">Login</Button>
              <Button 
                type="button" 
                onClick={handleBackToFaculty}
                className="back-button"
              >
                Change Faculty
              </Button>
            </div>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;