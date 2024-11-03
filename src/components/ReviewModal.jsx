import React, { useState, useEffect } from 'react';
import '../styles/ReviewModal.css';

const predefinedMessages = [
  "Discuss project updates",
  "Team retrospective",
  "Client feedback session",
  "Sprint planning",
  "Budget review",
  "Brainstorming new ideas",
  "Technical deep dive",
  "Performance evaluations",
  "Training and development",
  "Miscellaneous"
];

const ReviewModal = ({ 
  onClose, 
  facultyName, 
  selectedDate, 
  selectedTime, 
  reason, 
  duration,
  onConfirm,
  isLoading,
  meetingDurations,
  onUpdateReason,
  onUpdateDuration,
  onUpdateDate,
  onUpdateTime,
  availableTimes,
  blockedTimeSlots,
  facultyId
}) => {
  const [editField, setEditField] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimesForDate, setAvailableTimesForDate] = useState([]);

  useEffect(() => {
    if (editField === 'date') {
      computeAvailableDatesForWeek(currentWeekStart);
    }
  }, [currentWeekStart, availableTimes, blockedTimeSlots, editField]);

  useEffect(() => {
    if (selectedDate) {
      computeAvailableTimesForDate(selectedDate);
    }
  }, [selectedDate, availableTimes, blockedTimeSlots]);

  const computeAvailableDatesForWeek = (startDate) => {
    const dates = [];
    const weekEnd = new Date(startDate);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = new Date(startDate); day < weekEnd; day.setDate(day.getDate() + 1)) {
      if (day >= today) {
        const dayOfWeek = day.toLocaleString('en-US', { weekday: 'long' });
        const dayAvailability = availableTimes.find(slot => slot.day === dayOfWeek);

        if (dayAvailability) {
          const isBlocked = blockedTimeSlots.some(slot => 
            slot.date === day.toISOString().split('T')[0]
          );

          if (!isBlocked) {
            dates.push(new Date(day));
          }
        }
      }
    }
    setAvailableDates(dates);
  };

  const computeAvailableTimesForDate = (date) => {
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
    const dayAvailability = availableTimes.find(slot => slot.day === dayOfWeek);
    
    if (!dayAvailability) {
      setAvailableTimesForDate([]);
      return;
    }

    const [startHour, startMinute] = dayAvailability.start_time.split(':').map(Number);
    const [endHour, endMinute] = dayAvailability.end_time.split(':').map(Number);
    
    const times = [];
    const currentTime = new Date(date);
    currentTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      const isBlocked = blockedTimeSlots.some(slot => 
        slot.date === date.toISOString().split('T')[0] && 
        slot.start === timeString
      );

      if (!isBlocked) {
        times.push(timeString);
      }
      
      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }

    setAvailableTimesForDate(times);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (direction === -1 && newDate < today) {
      return;
    }
    
    setCurrentWeekStart(newDate);
  };

  const formatDate = (date) => {
    if (!date) return 'No date selected';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return 'No time selected';
    try {
      const [hours, minutes] = time.split(':');
      const timeObj = new Date();
      timeObj.setHours(hours, minutes);
      return timeObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid time format';
    }
  };

  const isCurrentWeek = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return currentWeekStart <= today;
  };

  const renderPopupContent = () => {
    switch (editField) {
      case 'date':
        return (
          <>
            <h2>Select Date</h2>
            <div className="edit-popup-content">
              <div className="week-navigation">
                <button 
                  className={`review-modal-button ${isCurrentWeek() ? 'disabled' : 'next'}`}
                  onClick={() => navigateWeek(-1)}
                  disabled={isCurrentWeek()}
                >
                  Previous Week
                </button>
                <span className="week-label">
                  {currentWeekStart.toLocaleDateString()} - 
                  {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
                <button 
                  className="review-modal-button next"
                  onClick={() => navigateWeek(1)}
                >
                  Next Week
                </button>
              </div>
              <div className="available-dates">
                {availableDates.map((date, index) => (
                  <div
                    key={index}
                    className="edit-option"
                    onClick={() => {
                      onUpdateDate(date);
                      setEditField(null);
                    }}
                  >
                    {formatDate(date)}
                  </div>
                ))}
                {availableDates.length === 0 && (
                  <div className="no-dates-message">
                    No available dates for this week
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 'time':
        return (
          <>
            <h2>Select Time</h2>
            <div className="edit-popup-content">
              {availableTimesForDate.map((time, index) => (
                <div
                  key={index}
                  className="edit-option"
                  onClick={() => {
                    onUpdateTime(time);
                    setEditField(null);
                  }}
                >
                  {formatTime(time)}
                </div>
              ))}
              {availableTimesForDate.length === 0 && (
                <div className="no-times-message">
                  No available times for this date
                </div>
              )}
            </div>
          </>
        );

      case 'duration':
        return (
          <>
            <h2>Select Duration</h2>
            <div className="edit-popup-content">
              {meetingDurations.map((dur, index) => (
                <div
                  key={index}
                  className="edit-option"
                  onClick={() => {
                    onUpdateDuration(dur);
                    setEditField(null);
                  }}
                >
                  {dur.label}
                </div>
              ))}
            </div>
          </>
        );

      case 'reason':
        return (
          <>
            <h2>Select Reason</h2>
            <div className="edit-popup-content">
              {predefinedMessages.map((msg, index) => (
                <div
                  key={index}
                  className="edit-option"
                  onClick={() => {
                    onUpdateReason(msg);
                    setEditField(null);
                  }}
                >
                  {msg}
                </div>
              ))}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="review-modal-page">
      {!editField ? (
        <div className="review-modal-container">
          <div className="review-modal-card">
            <div className="review-modal-content">
              <h2>Review Meeting Details</h2>
              
              <div className="review-modal-details">
                <div className="review-modal-info">
                  <p className="review-modal-from">Meeting with: Prof. {facultyName}</p>
                </div>
                
                <div className="review-modal-field">
                  <strong>Date:</strong>
                  <div 
                    className="review-modal-value"
                    onClick={() => setEditField('date')}
                  >
                    {formatDate(selectedDate)}
                    <span className="edit-icon">✎</span>
                  </div>
                </div>
                
                <div className="review-modal-field">
                  <strong>Time:</strong>
                  <div 
                    className="review-modal-value"
                    onClick={() => setEditField('time')}
                  >
                    {formatTime(selectedTime)}
                    <span className="edit-icon">✎</span>
                  </div>
                </div>
                
                <div className="review-modal-field">
                  <strong>Duration:</strong>
                  <div 
                    className="review-modal-value"
                    onClick={() => setEditField('duration')}
                  >
                    {duration || 'No duration selected'}
                    <span className="edit-icon">✎</span>
                  </div>
                </div>
                
                <div className="review-modal-field">
                  <strong>Reason for Meeting:</strong>
                  <div 
                    className="review-modal-value"
                    onClick={() => setEditField('reason')}
                  >
                    {reason || 'No reason selected'}
                    <span className="edit-icon">✎</span>
                  </div>
                </div>
              </div>

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
      ) : (
        <div className="review-modal-container">
          <div className="review-modal-card">
            <div className="review-modal-content">
              {renderPopupContent()}
              <div className="review-modal-buttons">
                <button 
                  className="review-modal-button previous"
                  onClick={() => setEditField(null)}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewModal;