import React, { useState } from 'react';
import Button from './Button';
import BackgroundLogos from './BackgroundLogos';
import '../styles/PiMessageModal.css';

const PiMessageModal = ({ messages, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev === messages.length - 1 ? prev : prev + 1
    );
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? prev : prev - 1
    );
  };

  const currentMessage = messages[currentIndex];

  return (
    <div className="message-page">
      <BackgroundLogos logoSrc="/rcnnct.png" />
      <div className="message-container">
        <div className="message-card">
          <div className="message-content">
            <h2>Important Messages</h2>
            
            <div className="message-text-container">
              {messages.length > 1 && (
                <button 
                  className="nav-button prev"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  ‹
                </button>
              )}
              
              <div className="message-text">
                <div className="message-info">
                  <span className="message-from">From Faculty ID: {currentMessage.user_id}</span>
                </div>
                {currentMessage.message}
              </div>

              {messages.length > 1 && (
                <button 
                  className="nav-button next"
                  onClick={handleNext}
                  disabled={currentIndex === messages.length - 1}
                >
                  ›
                </button>
              )}
            </div>

            {messages.length > 1 && (
              <div className="message-pagination">
                {messages.map((_, index) => (
                  <div 
                    key={index}
                    className={`pagination-dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )}

            <div className="message-footer">
              <div className="message-counter">
                {messages.length > 1 && `Message ${currentIndex + 1} of ${messages.length}`}
              </div>
              <Button 
                onClick={currentIndex === messages.length - 1 ? onClose : handleNext}
                className="login-button"
              >
                {currentIndex === messages.length - 1 ? 'Continue to Login' : 'Next Message'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PiMessageModal;