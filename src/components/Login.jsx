import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import '../styles/Login.css';
import logoSrc from '/rcnnct.png'; // Adjust the path as per your setup
import cscLogo from '/CSC logo.png'; // Adjust the path as per your setup

const Login = () => {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false); // State to toggle keypad
  const navigate = useNavigate();
  const { setUser, user } = useAppContext();

  // If user is already logged in, redirect to faculty selection
  useEffect(() => {
    if (user) {
      navigate('/select-faculty');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiService.kioskLogin(userId);

      // Set user in context
      setUser({
        id: response.id,
        student_id: response.student_id,
        first_name: response.first_name,
        last_name: response.last_name,
        email: response.email,
      });

      // Navigate to faculty selection
      navigate('/select-faculty', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.response) {
        errorMessage = error.response.data?.detail || 'Login failed. Please try again.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Keypad input handler
  const handleKeypadClick = (number) => {
    setUserId(prev => prev + number);
  };

  // Input focus handler to open keypad
  const handleInputFocus = () => {
    setShowKeypad(true); // Open keypad on input focus
  };

  return (
    <div className="login">
      <BackgroundLogos logoSrc={logoSrc} />
      <div className="login-container">
        <div className="logo-card">
          <img src={cscLogo} alt="CSC Logo" className="logo-image" />
        </div>

        <div className="right-card">
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
                disabled={loading}
                onFocus={handleInputFocus} // Open keypad when the input is focused
              />
            </div>
            <div className="button-group">
              <Button 
                type="submit" 
                className="login-button"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>

        {/* Keypad Pop-up */}
        {showKeypad && (
          <div className="keypad-overlay">
            <div className="keypad fancy-keypad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <button
                  key={num}
                  className="keypad-button"
                  onClick={() => handleKeypadClick(num)}
                >
                  {num}
                </button>
              ))}
              <Button
                type="button"
                className="login-button"
                onClick={() => setShowKeypad(false)} // Close keypad
              >
                Close Keypad
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
