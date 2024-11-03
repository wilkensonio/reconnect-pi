import React from 'react';
import '../styles/ReviewModal.css';

const ReviewModal = ({ 
  onClose, 
  facultyName, 
  selectedDate, 
  selectedTime, 
  reason, 
  duration,
  onConfirm,
  isLoading 
}) => {
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const timeObj = new Date();
    timeObj.setHours(hours, minutes);
    return timeObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="review-modal-container">
      <div className="review-modal-card">
        <div className="review-modal-content">
          <h2>Review Meeting Details</h2>
          
          <div className="review-modal-text-container">
            <div className="review-modal-text">
              <div className="review-modal-info">
                <p className="review-modal-from">Meeting with: Prof. {facultyName}</p>
              </div>
              
              <div>
                <strong>Date:</strong>
                <p>{formatDate(selectedDate)}</p>
              </div>
              
              <div>
                <strong>Time:</strong>
                <p>{formatTime(selectedTime)}</p>
              </div>
              
              <div>
                <strong>Duration:</strong>
                <p>{duration}</p>
              </div>
              
              <div>
                <strong>Reason for Meeting:</strong>
                <p>{reason}</p>
              </div>
            </div>
          </div>

          <div className="review-modal-footer">
            <div className="review-modal-buttons">
              <button 
                className="review-modal-button previous"
                onClick={onClose}
                disabled={isLoading}
              >
                Back
              </button>
              <button 
                className="review-modal-button next"
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? 'Scheduling...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;