import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from './Calendar';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import { apiService } from '../services/api';
import '../styles/Schedule.css';
import logoSrc from '/rcnnct.png';

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

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Scheduling meeting:', { date: selectedDate, reason });
      await apiService.createMeeting({
        date: selectedDate.toISOString(),
        reason
      });
      console.log('Meeting scheduled successfully');
      alert('Meeting scheduled successfully');
      navigate('/view');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting. Please try again.');
    }
  };

  const handlePredefinedMessageClick = (message) => {
    console.log('Selected predefined message:', message);
    setReason(message);
    setIsDropdownVisible(false);
  };

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  return (
    <div className="schedule">
      <BackgroundLogos logoSrc={logoSrc} />
      <form onSubmit={handleSubmit} className="schedule-form card">
        <h2>Schedule Meeting</h2>
        <div className="date-picker-container">
          <label htmlFor="date-picker">Select Date and Time:</label>
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              console.log('Selected date:', date);
              setSelectedDate(date);
            }}
          />
        </div>
        <div className="reason-container">
          <label htmlFor="reason-input">Reason for Meeting:</label>
          <div className="input-dropdown-container" ref={dropdownRef}>
            <input
              id="reason-input"
              ref={inputRef}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onClick={toggleDropdown}
              placeholder="Click to select or enter a reason"
              required
              className="reason-input"
            />
            {isDropdownVisible && (
              <div className="predefined-messages">
                {predefinedMessages.map((message, index) => (
                  <div
                    key={index}
                    className="predefined-message"
                    onClick={() => handlePredefinedMessageClick(message)}
                    tabIndex="0"
                    role="option"
                  >
                    {message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="button-container">
          <Button type="submit">Schedule Meeting</Button>
          <Button onClick={() => {
            console.log('Navigating back to home');
            navigate('/');
          }} className="back-button">Back to Home</Button>
        </div>
      </form>
    </div>
  );
};

export default Schedule;