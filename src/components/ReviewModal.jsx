import React, { useState, useEffect } from 'react';
import '../styles/ReviewModal.css';

const predefinedMessages = [
  { label: "Discuss project updates", value: "project_updates" },
  { label: "Team retrospective", value: "team_retrospective" },
  { label: "Client feedback session", value: "client_feedback" },
  { label: "Sprint planning", value: "sprint_planning" },
  { label: "Budget review", value: "budget_review" },
  { label: "Brainstorming new ideas", value: "brainstorming" },
  { label: "Technical deep dive", value: "technical_deep_dive" },
  { label: "Performance evaluations", value: "performance_evaluations" },
  { label: "Training and development", value: "training" },
  { label: "Miscellaneous", value: "miscellaneous" }
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
  facultyId,
  isRescheduling = false,
  originalAppointment = null
}) => {
  const [isDurationInvalid, setIsDurationInvalid] = useState(false);
  const [editField, setEditField] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate) {
      const selectedWeekStart = new Date(selectedDate);
      selectedWeekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
      return selectedWeekStart;
    }
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

  const calculateMaxAvailableDuration = (selectedTime) => {
    if (!selectedDate || !selectedTime) return 0;
    
    const dayOfWeek = selectedDate.toLocaleString('en-US', { weekday: 'long' });
    const dayAvailability = availableTimes.find(slot => slot.day === dayOfWeek);
    if (!dayAvailability) return 0;

    const [selectedHour, selectedMinute] = selectedTime.split(':').map(Number);
    const selectedTimeInMinutes = selectedHour * 60 + selectedMinute;

    const [endHour, endMinute] = dayAvailability.end_time.split(':').map(Number);
    const endTimeInMinutes = endHour * 60 + endMinute;

    const dateStr = selectedDate.toISOString().split('T')[0];
    const relevantBlockedSlots = isRescheduling && originalAppointment ?
      blockedTimeSlots.filter(slot => 
        !(slot.date === dateStr && slot.start === originalAppointment.start_time)
      ) : blockedTimeSlots;

    const nextBlockedTime = relevantBlockedSlots
      .filter(slot => slot.date === dateStr)
      .map(slot => {
        const [blockHour, blockMinute] = slot.start.split(':').map(Number);
        return blockHour * 60 + blockMinute;
      })
      .filter(time => time > selectedTimeInMinutes)
      .sort((a, b) => a - b)[0] || endTimeInMinutes;

    return nextBlockedTime - selectedTimeInMinutes;
  };

  const computeAvailableDatesForWeek = (startDate) => {
    const dates = [];
    const weekEnd = new Date(startDate);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const effectiveStartDate = startDate < today ? today : new Date(startDate);
  
    for (let day = new Date(effectiveStartDate); day < weekEnd; day.setDate(day.getDate() + 1)) {
      const dayOfWeek = day.toLocaleString('en-US', { weekday: 'long' });
      const dayAvailability = availableTimes.find(slot => slot.day === dayOfWeek);
  
      if (dayAvailability) {
        const dateStr = day.toISOString().split('T')[0];
        let dayBlockedSlots = blockedTimeSlots.filter(slot => slot.date === dateStr);

        // Handle rescheduling case
        if (isRescheduling && originalAppointment && originalAppointment.date === dateStr) {
          dayBlockedSlots = dayBlockedSlots.filter(slot => 
            slot.start !== originalAppointment.start_time
          );
        }
        
        const [availStartHour, availStartMin] = dayAvailability.start_time.split(':').map(Number);
        const [availEndHour, availEndMin] = dayAvailability.end_time.split(':').map(Number);
        
        const blockedRanges = dayBlockedSlots.map(slot => {
          const [startHour, startMin] = slot.start.split(':').map(Number);
          const [endHour, endMin] = slot.end.split(':').map(Number);
          return {
            start: startHour * 60 + startMin,
            end: endHour * 60 + endMin
          };
        });
  
        const availableStart = availStartHour * 60 + availStartMin;
        const availableEnd = availEndHour * 60 + availEndMin;
        
        let hasAvailableSlot = false;
        let currentTime = availableStart;
  
        while (currentTime < availableEnd) {
          const isBlocked = blockedRanges.some(range => 
            currentTime >= range.start && currentTime < range.end
          );
  
          if (!isBlocked) {
            hasAvailableSlot = true;
            break;
          }
          currentTime += 15;
        }
  
        if (hasAvailableSlot) {
          dates.push(new Date(day));
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

    const dateStr = date.toISOString().split('T')[0];
    
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);

      const isInOriginalTimeBlock = originalAppointment && 
      dateStr === originalAppointment.date && 
      timeString >= originalAppointment.start_time && 
      timeString < originalAppointment.end_time;
      
      // Special handling for rescheduling
      if (isRescheduling && isInOriginalTimeBlock) {
        times.push(timeString);
      } else {
        const isBlocked = blockedTimeSlots.some(slot => 
          slot.date === dateStr && 
          slot.start === timeString &&
          !(isRescheduling && isInOriginalTimeBlock)
        );
    
        if (!isBlocked && (currentTime > new Date() || isInOriginalTimeBlock)) {
          times.push(timeString);
        }
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
    const todayWeekStart = new Date(today);
    todayWeekStart.setDate(today.getDate() - today.getDay());
    todayWeekStart.setHours(0, 0, 0, 0);
    
    if (direction === -1 && newDate < todayWeekStart) {
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
    const todayWeekStart = new Date(today);
    todayWeekStart.setDate(today.getDate() - today.getDay());
    todayWeekStart.setHours(0, 0, 0, 0);
    
    const currentWeekStartCopy = new Date(currentWeekStart);
    currentWeekStartCopy.setHours(0, 0, 0, 0);
    
    return currentWeekStartCopy.getTime() <= todayWeekStart.getTime();
  };

  const canEdit = (field) => {
    switch (field) {
      case 'date': return typeof onUpdateDate === 'function';
      case 'time': return typeof onUpdateTime === 'function';
      case 'duration': return typeof onUpdateDuration === 'function';
      case 'reason': return typeof onUpdateReason === 'function';
      default: return false;
    }
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
                  className={`review-modal-button ${isCurrentWeek() ? 'disabled-grey' : ''}`}
                  onClick={() => !isCurrentWeek() && navigateWeek(-1)}
                  disabled={isCurrentWeek()}
                >
                  Previous Week
                </button>
                <span className="week-label">
                  {currentWeekStart.toLocaleDateString()} - 
                  {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
                <button 
                  className="review-modal-button"
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
                    const maxAvailable = calculateMaxAvailableDuration(time);
                    if (duration) {
                      const currentDuration = parseInt(duration.match(/\d+/)[0], 10);
                      if (currentDuration > maxAvailable) {
                        onUpdateDuration(null);
                        setIsDurationInvalid(true);
                      }
                    }
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
                      if (onUpdateReason) {
                        onUpdateReason(msg.label);  // Pass label string instead of object
                      }
                      setEditField(null);
                    }}
                  >
                    {msg.label}
                    {reason === msg.label && <span className="selected-indicator"> ✓</span>}
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
              <h2>{isRescheduling ? 'Reschedule Meeting' : 'Review Meeting Details'}</h2>
              
              <div className="review-modal-details">
                <div className="review-modal-info">
                  <p className="review-modal-from">Meeting with: Prof. {facultyName}</p>
                </div>
                
                <div className="review-modal-field">
                  <strong>Date:</strong>
                  <div 
                    className={`review-modal-value ${canEdit('date') ? 'editable' : ''}`}
                    onClick={() => canEdit('date') && setEditField('date')}
                  >
                    {formatDate(selectedDate)}
                    {canEdit('date') && <span className="edit-icon">✎</span>}
                  </div>
                </div>
                
                <div className="review-modal-field">
                  <strong>Time:</strong>
                  <div 
                    className={`review-modal-value ${canEdit('time') ? 'editable' : ''}`}
                    onClick={() => canEdit('time') && setEditField('time')}
                  >
                    {formatTime(selectedTime)}
                    {canEdit('time') && <span className="edit-icon">✎</span>}
                  </div>
                </div>
                
                <div className="review-modal-field">
                  <strong>Duration:</strong>
                  <div 
                    className={`review-modal-value ${canEdit('duration') ? 'editable' : ''}`}
                    onClick={() => canEdit('duration') && setEditField('duration')}
                  >
                    {duration || 'No duration selected'}
                    {canEdit('duration') && <span className="edit-icon">✎</span>}
                  </div>
                  {isDurationInvalid && (
                    <div className="error-message">
                      Selected duration is no longer available for this time slot
                    </div>
                  )}
                </div>
                
                <div className="review-modal-field">
                  <strong>Reason for Meeting:</strong>
                  <div 
                    className={`review-modal-value ${canEdit('reason') ? 'editable' : ''}`}
                    onClick={() => canEdit('reason') && setEditField('reason')}
                  >
                    {reason || 'No reason selected'}
                    {canEdit('reason') && <span className="edit-icon">✎</span>}
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
                  {isLoading ? 'Processing...' : isRescheduling ? 'Confirm Reschedule' : 'Confirm'}
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