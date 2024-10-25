// Schedule.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from './Calendar';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import '../styles/Schedule.css';
import logoSrc from '/rcnnct.png';
import LogoutButton from './LogoutButton';

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
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('');
  const [durationValue, setDurationValue] = useState(null);
  const [reason, setReason] = useState('');
  const [isReasonDropdownVisible, setIsReasonDropdownVisible] = useState(false);
  const [isDurationDropdownVisible, setIsDurationDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [meetingDurations, setMeetingDurations] = useState([]);

  const reasonDropdownRef = useRef(null);
  const durationDropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAppContext();
  const facultyId = sessionStorage.getItem('selected_faculty_id');

  useEffect(() => {
    if (!facultyId) {
      navigate('/', { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        const info = await apiService.getFacultyInfo(facultyId);
        setFacultyInfo(info);

        // Fetch availability and appointments
        const baseAvailability = await apiService.getAvailabilitiesByUser(facultyId);
        setAvailableTimes(baseAvailability);

        const existingAppointments = await apiService.getAppointmentsByUser(facultyId);
        setAppointments(existingAppointments);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      }
    };

    fetchData();
  }, [facultyId, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isReasonDropdownVisible && reasonDropdownRef.current && !reasonDropdownRef.current.contains(event.target)) {
        setIsReasonDropdownVisible(false);
      }
      if (isDurationDropdownVisible && durationDropdownRef.current && !durationDropdownRef.current.contains(event.target)) {
        setIsDurationDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isReasonDropdownVisible, isDurationDropdownVisible]);

  const handleDateTimeSelect = ({ date }) => {
    setSelectedDate(date);
    setSelectedTime(date.toTimeString().slice(0,5));
    setSelectedDuration('');
    setDurationValue(null);
    computePossibleDurations(date);
  };

  const computePossibleDurations = (selectedDateTime) => {
    // Get the faculty's availability on that day
    const dayOfWeek = selectedDateTime.toLocaleString('en-US', { weekday: 'long' });
    const dayAvailability = availableTimes.find(slot => slot.day === dayOfWeek);
    if (!dayAvailability) return;

    // Get the start and end times of the availability
    const [startHours, startMinutes] = dayAvailability.start_time.split(':').map(Number);
    const [endHours, endMinutes] = dayAvailability.end_time.split(':').map(Number);

    const availabilityStart = new Date(selectedDateTime);
    availabilityStart.setHours(startHours, startMinutes, 0, 0);

    const availabilityEnd = new Date(selectedDateTime);
    availabilityEnd.setHours(endHours, endMinutes, 0, 0);

    // Get the selected time
    const selectedTime = new Date(selectedDateTime);
    const [selectedHours, selectedMinutes] = selectedTime.toTimeString().slice(0,5).split(':').map(Number);
    selectedTime.setHours(selectedHours, selectedMinutes, 0, 0);

    // Get existing appointments on that date
    const dateString = selectedDateTime.toISOString().split('T')[0];
    const appointmentsOnDate = appointments.filter(apt => apt.date === dateString);

    // Sort appointments by start time
    appointmentsOnDate.sort((a, b) => a.start_time.localeCompare(b.start_time));

    // Find the next appointment after the selected time
    let nextAppointment = null;
    for (let apt of appointmentsOnDate) {
      const aptStart = new Date(`${apt.date}T${apt.start_time}`);
      if (aptStart > selectedTime) {
        nextAppointment = aptStart;
        break;
      }
    }

    // Determine the latest possible end time
    let latestEndTime = availabilityEnd;
    if (nextAppointment) {
      latestEndTime = nextAppointment;
    }

    // Calculate the maximum duration
    const maxDurationMs = latestEndTime - selectedTime;
    const maxDurationMinutes = Math.floor(maxDurationMs / 60000);

    // Define possible durations
    const durations = [15, 30, 45, 60];
    const possibleDurations = durations.filter(duration => duration <= maxDurationMinutes)
      .map(duration => ({ label: `${duration} minutes`, value: duration }));

    setMeetingDurations(possibleDurations);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !reason || !durationValue) {
      setError('Please select a date/time, meeting duration, and provide a reason for the meeting.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endTime = new Date(selectedDate);
      const [endHours, endMinutes] = selectedTime.split(':').map(Number);
      endTime.setHours(endHours, endMinutes, 0, 0);
      endTime.setMinutes(endTime.getMinutes() + durationValue);

      const endTimeString = endTime.toTimeString().slice(0, 5);

      const appointmentData = {
        date: selectedDate.toISOString().split('T')[0],
        start_time: selectedTime,
        end_time: endTimeString,
        reason,
        student_id: user?.student_id,
        faculty_id: facultyId
      };

      console.log('Submitting appointment:', appointmentData);
      await apiService.createAppointment(appointmentData);
      navigate('/view');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      setError(error.response?.data?.detail || 'Failed to schedule meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePredefinedMessageClick = (message) => {
    setReason(message);
    setIsReasonDropdownVisible(false);
  };

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration.label);
    setDurationValue(duration.value);
    setIsDurationDropdownVisible(false);
  };

  return (
    <div className="schedule">
      <BackgroundLogos logoSrc={logoSrc} />
      <div className="schedule-container">
        <div className="top-card">
          Schedule Meeting with: Prof. {facultyInfo?.last_name}
        </div>
        <div className="content-cards">
          <div className="left-card">
            <h2>Select Date and Time</h2>
            <div className="calendar-wrapper">
              <Calendar
                selectedDate={selectedDate}
                onSelectDate={handleDateTimeSelect}
                facultyId={facultyId}
              />
            </div>
          </div>

          <div className="right-card">
            <h2>Meeting Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Reason for Meeting:</label>
                <div className="input-dropdown-container" ref={reasonDropdownRef}>
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    onClick={() => setIsReasonDropdownVisible(!isReasonDropdownVisible)}
                    placeholder="Click to select a reason"
                    required
                    className="input-field"
                  />
                  {isReasonDropdownVisible && (
                    <div className="dropdown-menu">
                      {predefinedMessages.map((message, index) => (
                        <div
                          key={index}
                          className="dropdown-item"
                          onClick={() => handlePredefinedMessageClick(message)}
                        >
                          {message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedDate && selectedTime && meetingDurations.length > 0 && (
                <div className="input-group">
                  <label>Meeting Duration:</label>
                  <div className="input-dropdown-container" ref={durationDropdownRef}>
                    <input
                      value={selectedDuration}
                      readOnly
                      onClick={() => setIsDurationDropdownVisible(!isDurationDropdownVisible)}
                      placeholder="Select duration"
                      required
                      className="input-field"
                    />
                    {isDurationDropdownVisible && (
                      <div className="dropdown-menu">
                        {meetingDurations.map((duration, index) => (
                          <div
                            key={index}
                            className="dropdown-item"
                            onClick={() => handleDurationSelect(duration)}
                          >
                            {duration.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedDate && selectedTime && meetingDurations.length === 0 && (
                <div className="input-group">
                  <label>Meeting Duration:</label>
                  <input
                    value="No available durations"
                    readOnly
                    className="input-field"
                    disabled
                  />
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              <div className="button-group">
                <Button
                  type="submit"
                  className="full-width-button"
                  disabled={loading || !selectedDate || !selectedTime || !selectedDuration}
                >
                  {loading ? 'Scheduling...' : 'Schedule Meeting'}
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="full-width-button"
                >
                  Back to Home
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
