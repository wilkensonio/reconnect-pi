import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import '../styles/Login.css';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const keypadRef = useRef(null);
  const barcodeBuffer = useRef('');
  const barcodeTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const { setUser, user } = useAppContext();

  useEffect(() => {
    if (user) {
      navigate('/select-faculty');
    }
  }, [user, navigate]);

  // Handle barcode scanner input
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ignore keypress events if the keypad is shown
      if (showKeypad) return;

      // Ignore if the pressed key is not a number or Enter
      if (!/^\d$/.test(event.key) && event.key !== 'Enter') return;

      // Clear the timeout on each keypress
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }

      if (event.key === 'Enter') {
        // If Enter is pressed and we have input, submit it
        if (barcodeBuffer.current) {
          setUserId(barcodeBuffer.current);
          handleSubmit({ preventDefault: () => {} }, barcodeBuffer.current);
          barcodeBuffer.current = '';
        }
      } else {
        // Add the number to the buffer
        barcodeBuffer.current += event.key;

        // Set a timeout to clear the buffer if no keypress happens within 50ms
        // This helps distinguish between barcode scanner (rapid input) and keyboard
        barcodeTimeoutRef.current = setTimeout(() => {
          barcodeBuffer.current = '';
        }, 50);
      }
    };

    // Add the event listener
    window.addEventListener('keypress', handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }
    };
  }, [showKeypad]);

  const handleSubmit = async (e, barcodeInput = null) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const submittedId = barcodeInput || userId;

    try {
      const response = await apiService.kioskLogin(submittedId);
      setUser({
        id: response.id,
        student_id: response.student_id,
        first_name: response.first_name,
        last_name: response.last_name,
        email: response.email,
      });
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

  const createRippleEffect = (event, number) => {
    const button = event.currentTarget;
    const grid = keypadRef.current;
    if (!grid) return;

    const buttons = Array.from(grid.querySelectorAll('.keypad-button'));
    const buttonRect = button.getBoundingClientRect();
    const sourceX = buttonRect.left + buttonRect.width / 2;
    const sourceY = buttonRect.top + buttonRect.height / 2;

    const color = number === '←' ? '#e74c3c' : 
                 number === '↵' ? '#3b83f6' : 
                 '#3498db';

    buttons.forEach(btn => {
      const targetRect = btn.getBoundingClientRect();
      const targetX = targetRect.left + targetRect.width / 2;
      const targetY = targetRect.top + targetRect.height / 2;

      const distance = Math.sqrt(
        Math.pow(targetX - sourceX, 2) + 
        Math.pow(targetY - sourceY, 2)
      );

      const delay = (distance / 500) * 0.3;

      const ripple = document.createElement('div');
      ripple.classList.add('key-ripple');
      ripple.style.setProperty('--ripple-color', color);
      ripple.style.animationDelay = `${delay}s`;
      
      btn.appendChild(ripple);

      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    });
  };

  const handleKeypadClick = (number) => {
    setUserId(prev => prev + number);
  };

  const handleInputFocus = () => {
    setShowKeypad(true);
  };

  const handleKeypadSubmit = () => {
    setShowKeypad(false);
    if (userId) {
      handleSubmit({ preventDefault: () => {} });
    }
  };

  const handleBackspace = () => {
    setUserId(prev => prev.slice(0, -1));
  };

  return (
    <div className="login">
      <BackgroundLogos logoSrc="/rcnnct.png" />
      <div className="login-container">
        <div className="unified-card">
          <div className="card-content">
            <div className="logo-section">
              <img src="/CSC logo.png" alt="CSC Logo" className="logo-image" />
            </div>

            <div className="login-section">
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
                    onFocus={handleInputFocus}
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
              <div className="scan-box">
              <span className="arrow-down">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path d="M12 16l-6-6h12z" fill="#ffffff"/>
                </svg>
              </span>
              Scan Here!
            </div>
            </div>
          </div>
        </div>

        {showKeypad && (
          <div className="keypad-overlay">
            <div className="keypad">
              <div className="keypad-display">
                <span 
                  className="display-value"
                  ref={el => {
                    if (el) {
                      const containerWidth = el.parentElement.offsetWidth - 32; // Account for padding
                      const contentWidth = el.scrollWidth;
                      const scale = Math.min(1, containerWidth / contentWidth);
                      el.style.setProperty('--scale', scale);
                    }
                  }}
                >
                  {userId}
                </span>
              </div>
              <div className="keypad-grid" ref={keypadRef}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    className="keypad-button"
                    onClick={(e) => {
                      handleKeypadClick(num);
                      createRippleEffect(e, num);
                    }}
                  >
                    {num}
                  </button>
                ))}
                <button
                  className="keypad-button"
                  onClick={(e) => {
                    handleKeypadClick(0);
                    createRippleEffect(e, 0);
                  }}
                >
                  0
                </button>
                <button
                  className="keypad-button function-button"
                  onClick={(e) => {
                    handleBackspace();
                    createRippleEffect(e, '←');
                  }}
                >
                  ←
                </button>
                <button
                  className="keypad-button enter-button"
                  onClick={(e) => {
                    handleKeypadSubmit();
                    createRippleEffect(e, '↵');
                  }}
                >
                  ↵
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    
  );
};

export default Login;