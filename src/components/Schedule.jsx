import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from './Calendar';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import ReviewModal from './ReviewModal';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import '../styles/Schedule.css';
import '../styles/ReviewModal.css';
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
  const [studentAppointments, setStudentAppointments] = useState([]);
  const [meetingDurations, setMeetingDurations] = useState([]);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDateSelected, setIsDateSelected] = useState(false);
  const [isTimeSelected, setIsTimeSelected] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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

        const baseAvailability = await apiService.getAvailabilitiesByUser(facultyId);
        setAvailableTimes(baseAvailability);

        const facultyAppointments = await apiService.getAppointmentsByUser(facultyId);
        setAppointments(facultyAppointments);

        if (user?.student_id) {
          const studentExistingAppointments = await apiService.getAppointmentsByUser(user.student_id);
          setStudentAppointments(studentExistingAppointments);

          const allBlockedSlots = [...facultyAppointments, ...studentExistingAppointments].map(apt => ({
            date: apt.date,
            start: apt.start_time,
            end: apt.end_time
          }));
          setBlockedTimeSlots(allBlockedSlots);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('No appointment times available. Please try again later.');
      }
    };

    fetchData();
  }, [facultyId, navigate, user?.student_id]);

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

  useEffect(() => {
    if (!isDateSelected) {
      setCurrentStep(1);
    } else if (!isTimeSelected) {
      setCurrentStep(2);
    } else if (!reason) {
      setCurrentStep(3);
    } else if (!selectedDuration) {
      setCurrentStep(4);
    } else {
      setCurrentStep(5);
    }
  }, [isDateSelected, isTimeSelected, reason, selectedDuration]);

  const handleDateTimeSelect = ({ date }) => {
    if (selectedDate && date.toDateString() !== selectedDate.toDateString()) {
      // If selecting a different date at any point, reset from there
      setSelectedDate(date);
      setIsDateSelected(true);
      setSelectedTime(null);
      setIsTimeSelected(false);
      setReason('');
      setSelectedDuration('');
      setDurationValue(null);
    } else if (!isDateSelected) {
      // First time selecting a date
      setSelectedDate(date);
      setIsDateSelected(true);
      setSelectedTime(null);
      setIsTimeSelected(false);
      setReason('');
      setSelectedDuration('');
      setDurationValue(null);
    } else if (!isTimeSelected || (selectedDate && date.toDateString() === selectedDate.toDateString())) {
      // Selecting or changing time on same date
      setSelectedDate(date);
      setSelectedTime(date.toTimeString().slice(0,5));
      setIsTimeSelected(true);
      computePossibleDurations(date);
      // Only reset subsequent steps when changing time
      setReason('');
      setSelectedDuration('');
      setDurationValue(null);
    }
  };

  const isTimeSlotBlocked = (dateTime, duration) => {
    const startTime = new Date(dateTime);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    const dateStr = startTime.toISOString().split('T')[0];

    return blockedTimeSlots.some(blocked => {
      if (blocked.date !== dateStr) return false;

      const [blockStartHours, blockStartMinutes] = blocked.start.split(':').map(Number);
      const [blockEndHours, blockEndMinutes] = blocked.end.split(':').map(Number);

      const blockStart = new Date(startTime);
      blockStart.setHours(blockStartHours, blockStartMinutes, 0, 0);

      const blockEnd = new Date(startTime);
      blockEnd.setHours(blockEndHours, blockEndMinutes, 0, 0);

      return (
        (startTime < blockEnd && endTime > blockStart) ||
        (startTime >= blockStart && startTime < blockEnd) ||
        (endTime > blockStart && endTime <= blockEnd)
      );
    });
  };

  const computePossibleDurations = (selectedDateTime) => {
    if (!selectedDateTime) return;

    const dayOfWeek = selectedDateTime.toLocaleString('en-US', { weekday: 'long' });
    const dayAvailability = availableTimes.find(slot => slot.day === dayOfWeek);
    if (!dayAvailability) return;

    const [startHours, startMinutes] = dayAvailability.start_time.split(':').map(Number);
    const [endHours, endMinutes] = dayAvailability.end_time.split(':').map(Number);

    const availabilityStart = new Date(selectedDateTime);
    availabilityStart.setHours(startHours, startMinutes, 0, 0);

    const availabilityEnd = new Date(selectedDateTime);
    availabilityEnd.setHours(endHours, endMinutes, 0, 0);

    const selectedTime = new Date(selectedDateTime);
    const [selectedHours, selectedMinutes] = selectedDateTime.toTimeString().slice(0,5).split(':').map(Number);
    selectedTime.setHours(selectedHours, selectedMinutes, 0, 0);

    const maxDurationMs = availabilityEnd - selectedTime;
    const maxDurationMinutes = Math.floor(maxDurationMs / 60000);

    const durations = [15, 30, 45, 60];
    const possibleDurations = durations
      .filter(duration => duration <= maxDurationMinutes)
      .filter(duration => !isTimeSlotBlocked(selectedTime, duration))
      .map(duration => ({ label: `${duration} minutes`, value: duration }));

    setMeetingDurations(possibleDurations);
  };

  const handleUpdateDate = (newDate) => {
    setSelectedDate(newDate);
    setIsDateSelected(true);
    setSelectedTime(null);
    setIsTimeSelected(false);
    setSelectedDuration('');
    setDurationValue(null);
    computePossibleDurations(newDate);
  };

  const handleUpdateTime = (newTime) => {
    setSelectedTime(newTime);
    setIsTimeSelected(true);
    const timeDate = new Date(selectedDate);
    const [hours, minutes] = newTime.split(':').map(Number);
    timeDate.setHours(hours, minutes);
    computePossibleDurations(timeDate);
  };

  const handleUpdateDuration = (duration) => {
    setSelectedDuration(duration.label);
    setDurationValue(duration.value);
  };

  const handleUpdateReason = (newReason) => {
    setReason(newReason);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !reason || !durationValue) {
      setError('Please complete all required fields.');
      return;
    }
    setIsReviewModalOpen(true);
  };

  const handleConfirmSchedule = async () => {
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

      await apiService.createAppointment(appointmentData);
      navigate('/view');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      setError(error.response?.data?.detail || 'Failed to schedule meeting. Please try again.');
      setIsReviewModalOpen(false);
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

  const getStepPrompt = () => {
    switch (currentStep) {
      case 1:
        return "Select a Date";
      case 2:
        return "Select a Time";
      case 3:
        return "Select Meeting Reason";
      case 4:
        return "Select Meeting Duration";
      case 5:
        return "Review and Schedule";
      default:
        return "Select a Date";
    }
  };

  return (
    <div className="schedule">
      <BackgroundLogos logoSrc={logoSrc} />
      <div className="schedule-container" style={{ position: 'relative' }}>
        <div className="top-card">
          Schedule Meeting with: Prof. {facultyInfo?.last_name}
        </div>
        <div className="content-cards">
          <div className="left-card">
            <h2>{getStepPrompt()}</h2>
            <div className="calendar-wrapper">
              <Calendar
                selectedDate={selectedDate}
                onSelectDate={handleDateTimeSelect}
                facultyId={facultyId}
                blockedTimeSlots={blockedTimeSlots}
                availableTimes={availableTimes}
              />
            </div>
          </div>

          <div className="right-card">
            <h2>Meeting Details</h2>
            <form onSubmit={handleSubmit}>
              {currentStep >= 3 && (
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
              )}

              {currentStep >= 4 && reason && (
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

              {error && <div className="error-message">{error}</div>}

              <div className="button-group">
                <Button
                  type="submit"
                  className={`full-width-button ${currentStep < 5 ? 'button-disabled' : ''}`}
                  disabled={currentStep < 5 || loading}
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

        {isReviewModalOpen && (
          <div className="review-modal-page">
            <ReviewModal
              onClose={() => setIsReviewModalOpen(false)}
              facultyName={facultyInfo?.last_name}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              reason={reason}
              duration={selectedDuration}
              onConfirm={handleConfirmSchedule}
              isLoading={loading}
              meetingDurations={meetingDurations}
              availableTimes={availableTimes}
              blockedTimeSlots={blockedTimeSlots}
              facultyId={facultyId}
              onUpdateDate={handleUpdateDate}
              onUpdateTime={handleUpdateTime}
              onUpdateReason={handleUpdateReason}
              onUpdateDuration={handleUpdateDuration}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;