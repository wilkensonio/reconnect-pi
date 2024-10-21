import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from './Calendar';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
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
  const { user } = useAppContext();

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
      const appointmentData = {
        date: selectedDate.toISOString().split('T')[0],
        start_time: selectedDate.toTimeString().slice(0, 5),
        end_time: new Date(selectedDate.getTime() + 45 * 60000).toTimeString().slice(0, 5),
        reason,
        student_id: user?.student_id,
        faculty_id: "70578617" // This should be dynamically set based on faculty member
      };
      await apiService.createAppointment(appointmentData);
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
      <div className="schedule-container">
        <div className="schedule-card title-card">
          <h2 className="schedule-title">Schedule Meeting</h2>
        </div>
        <form onSubmit={handleSubmit} className="schedule-form">
          <div className="schedule-card date-picker-card">
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
          </div>
          <div className="schedule-card reason-card">
            <div className="reason-container">
              <label htmlFor="reason-input">Reason for Meeting:</label>
              <div className="input-dropdown-container" ref={dropdownRef}>
                <input
                  id="reason-input"
                  ref={inputRef}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  onClick={toggleDropdown}
                  placeholder="Click to select a reason"
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
              <Button type="submit" className="full-width-button large-button">Schedule Meeting</Button>
              <Button onClick={() => navigate('/')} className="full-width-button large-button back-button">Back to Home</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Schedule;