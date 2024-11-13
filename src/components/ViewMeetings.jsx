import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import ReviewModal from './ReviewModal';
import '../styles/ViewMeetings.css';
import '../styles/ReviewModal.css';
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

const ViewMeetings = () => {
  // Original ViewMeetings state
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [checkingInId, setCheckingInId] = useState(null);
  const [facultyInfo, setFacultyInfo] = useState({});
  const [showPastAppointments, setShowPastAppointments] = useState(false);
  const [pastAppointments, setPastAppointments] = useState([]);

  // Scheduling state (matching Schedule.jsx)
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('');
  const [durationValue, setDurationValue] = useState(null);
  const [reason, setReason] = useState('');
  const [isReasonDropdownVisible, setIsReasonDropdownVisible] = useState(false);
  const [isDurationDropdownVisible, setIsDurationDropdownVisible] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [meetingDurations, setMeetingDurations] = useState([]);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState([]);
  const [isDateSelected, setIsDateSelected] = useState(false);
  const [isTimeSelected, setIsTimeSelected] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  
  const reasonDropdownRef = useRef(null);
  const durationDropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAppContext();

  const convertUTCToLocal = (dateStr, timeStr) => {
    // Create local date object
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
  
    // Debug logging
    console.log('Time comparison:', {
      input: `${dateStr} ${timeStr}`,
      localDate: date.toLocaleString(),
      utcDate: date.toUTCString()
    });
  
    return date;
  };

  // Initial appointments fetch
  const fetchAppointments = async () => {
    if (!user?.student_id) return;
  
    try {
      setLoading(true);
      const appointmentsResponse = await apiService.getAppointmentsByUser(user.student_id);
  
      // Split appointments into past and future
      const now = new Date();
      console.log('Current time:', now.toLocaleString());
  
      const { past, future } = appointmentsResponse.reduce((acc, apt) => {
        const appointmentDate = convertUTCToLocal(apt.date, apt.end_time);
        
        console.log('Comparing appointment:', {
          id: apt.id,
          date: apt.date,
          endTime: apt.end_time,
          localEndTime: appointmentDate.toLocaleString(),
          isPast: appointmentDate < now
        });
  
        if (appointmentDate < now) {
          acc.past.push(apt);
        } else {
          acc.future.push(apt);
        }
  
        return acc;
      }, { past: [], future: [] });

      // Sorting Function
      const sortAppointments = (appointments, isPast = false) => {
        return appointments.sort((a, b) => {
          // Parse start times as UTC for accurate comparison
          const dateA = convertUTCToLocal(a.date, a.start_time);
          const dateB = convertUTCToLocal(b.date, b.start_time);
          return isPast ? dateB - dateA : dateA - dateB;
        });
      };

      // Get unique faculty IDs from both past and future appointments
      const uniqueFacultyIds = [...new Set([...past, ...future].map(apt => apt.faculty_id))];
      const facultyInfoMap = {};

      // Fetch faculty info concurrently
      await Promise.all(
        uniqueFacultyIds.map(async (facultyId) => {
          const info = await apiService.getFacultyInfo(facultyId);
          if (info) {
            facultyInfoMap[facultyId] = info;
          }
        })
      );

      // Update state with sorted appointments and faculty info
      setFacultyInfo(facultyInfoMap);
      setPastAppointments(sortAppointments(past, true)); // Past appointments sorted reverse chronologically
      setAppointments(sortAppointments(future)); // Future appointments sorted chronologically
      setError(null);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch scheduling data matching Schedule.jsx
  const fetchSchedulingData = async (facultyId) => {
    try {
      // Get faculty info and base availability
      const info = await apiService.getFacultyInfo(facultyId);
      setFacultyInfo(prevState => ({ ...prevState, [facultyId]: info }));
  
      const baseAvailability = await apiService.getAvailabilitiesByUser(facultyId);
      setAvailableTimes(baseAvailability);
  
      // Get all appointments and create blocked slots
      const facultyAppts = await apiService.getAppointmentsByUser(facultyId);
      const studentAppts = await apiService.getAppointmentsByUser(user.student_id);
  
      // Combine all blocked slots except the current appointment
      const allBlockedSlots = [
        ...facultyAppts,
        ...studentAppts
      ]
        .filter(apt => apt.id !== selectedAppointment?.id)
        .map(apt => ({
          date: apt.date,
          start: apt.start_time,
          end: apt.end_time
        }));
  
      setBlockedTimeSlots(allBlockedSlots);
    } catch (error) {
      console.error('Error fetching scheduling data:', error);
      setError('Failed to load scheduling data');
    }
  };

  // Effect hooks for component updates
  useEffect(() => {
    fetchAppointments();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isReasonDropdownVisible && reasonDropdownRef.current && 
          !reasonDropdownRef.current.contains(event.target)) {
        setIsReasonDropdownVisible(false);
      }
      if (isDurationDropdownVisible && durationDropdownRef.current && 
          !durationDropdownRef.current.contains(event.target)) {
        setIsDurationDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isReasonDropdownVisible, isDurationDropdownVisible]);

  // Core scheduling logic matching Schedule.jsx
  const isTimeSlotBlocked = (dateTime, duration) => {
    const startTime = new Date(dateTime);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    const dateStr = startTime.toISOString().split('T')[0];
    const dayOfWeek = startTime.toLocaleString('en-US', { weekday: 'long' });

    // First check faculty's base availability
    const dayAvailability = availableTimes.find(slot => slot.day === dayOfWeek);
    if (!dayAvailability) return true;

    const [availStartHours, availStartMinutes] = dayAvailability.start_time.split(':').map(Number);
    const [availEndHours, availEndMinutes] = dayAvailability.end_time.split(':').map(Number);

    const availabilityStart = new Date(startTime);
    availabilityStart.setHours(availStartHours, availStartMinutes, 0, 0);

    const availabilityEnd = new Date(startTime);
    availabilityEnd.setHours(availEndHours, availEndMinutes, 0, 0);

    // Check if outside faculty's availability
    if (startTime < availabilityStart || endTime > availabilityEnd) {
      return true;
    }

    // Then check against all blocked slots
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

    // Find the next blocked slot for this date
    const dateStr = selectedDateTime.toISOString().split('T')[0];
    const nextBlockedSlot = blockedTimeSlots
      .filter(slot => slot.date === dateStr)
      .filter(slot => {
        const blockTime = new Date(`${dateStr}T${slot.start}`);
        return blockTime > selectedTime;
      })
      .sort((a, b) => {
        const timeA = new Date(`${dateStr}T${a.start}`);
        const timeB = new Date(`${dateStr}T${b.start}`);
        return timeA - timeB;
      })[0];

    // Calculate maximum available duration
    let maxDurationMs;
    if (nextBlockedSlot) {
      const nextBlockStart = new Date(`${dateStr}T${nextBlockedSlot.start}`);
      maxDurationMs = nextBlockStart - selectedTime;
    } else {
      maxDurationMs = availabilityEnd - selectedTime;
    }
    const maxDurationMinutes = Math.floor(maxDurationMs / 60000);

    const durations = [15, 30, 45, 60];
    const possibleDurations = durations
      .filter(duration => duration <= maxDurationMinutes)
      .filter(duration => !isTimeSlotBlocked(selectedTime, duration))
      .map(duration => ({ label: `${duration} minutes`, value: duration }));

    setMeetingDurations(possibleDurations);
  };

  // Calendar and selection handlers
  const handleDateTimeSelect = ({ date }) => {
    if (!isDateSelected) {
      setSelectedDate(date);
      setIsDateSelected(true);
      setSelectedTime(null);
      setIsTimeSelected(false);
      setSelectedDuration('');
      setDurationValue(null);
    } else if (!isTimeSelected) {
      setSelectedDate(date);
      setSelectedTime(date.toTimeString().slice(0,5));
      setIsTimeSelected(true);
      computePossibleDurations(date);
    }
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
    if (typeof newReason === 'string') {
      setReason(newReason);
    } else if (newReason?.label) {
      setReason(newReason.label);
    }
    setIsReasonDropdownVisible(false);
  };

  // Appointment action handlers
  const handleReschedule = async (appointment) => {
    setSelectedAppointment(appointment);
    
    // Initialize with current appointment values
    setReason(appointment.reason);
    
    // Reset scheduling state
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedDuration('');
    setDurationValue(null);
    setIsDateSelected(false);
    setIsTimeSelected(false);
    
    // Fetch scheduling data for the faculty member
    await fetchSchedulingData(appointment.faculty_id);
    
    setIsReviewModalOpen(true);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedDate || !selectedTime || !durationValue || !reason) {
      setError('Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);
      
      const endTime = new Date(selectedDate);
      const [endHours, endMinutes] = selectedTime.split(':').map(Number);
      endTime.setHours(endHours, endMinutes, 0, 0);
      endTime.setMinutes(endTime.getMinutes() + durationValue);

      const endTimeString = endTime.toTimeString().slice(0, 5);

      const appointmentData = {
        date: selectedDate.toISOString().split('T')[0],
        start_time: selectedTime,
        end_time: endTimeString,
        reason: reason,
        student_id: user?.student_id,
        faculty_id: selectedAppointment.faculty_id
      };

      // Delete old appointment and create new one
      await apiService.deleteAppointment(selectedAppointment.id);
      await apiService.createAppointment(appointmentData);
      
      setIsReviewModalOpen(false);
      setSelectedAppointment(null);
      resetSchedulingState();
      await fetchAppointments();
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      setError(error.response?.data?.detail || 'Failed to reschedule appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setDeletingId(appointmentId);
      await apiService.deleteAppointment(appointmentId);
      await fetchAppointments();
    } catch (error) {
      console.error('Error canceling appointment:', error);
      setError('Failed to cancel appointment. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCheckin = async (appointmentId) => {
    try {
      setCheckingInId(appointmentId);
      await apiService.studentCheckin(appointmentId);
      await fetchAppointments();
    } catch (error) {
      console.error('Error checking in:', error);
      setError('Failed to check in. Please try again.');
    } finally {
      setCheckingInId(null);
    }
  };

  const resetSchedulingState = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedDuration('');
    setDurationValue(null);
    setReason('');
    setIsDateSelected(false);
    setIsTimeSelected(false);
  };

  // Helper functions
  const canCheckIn = (appointment) => {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.start_time}`);
    const now = new Date();
    const checkInWindow = new Date(appointmentDateTime.getTime() - 15 * 60000); // 15 minutes before
    
    if (appointment.checked_in) {
      return 'checked';
    }
    
    if (now < checkInWindow) {
      return 'early';
    }
    
    return 'ready';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading && !isReviewModalOpen) {
    return (
      <div className="view-meetings">
        <BackgroundLogos logoSrc={logoSrc} />
        <div className="meetings-container">
          <div className="meetings-card">
            <div className="loading-container">
              <div className="loading-spinner" />
              <p>Loading appointments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-meetings">
      <BackgroundLogos logoSrc={logoSrc} />
      <div className="meetings-container">
        <div className="meetings-card">
          <h2>Your Appointments</h2>
          
          <div className="appointments-list-container">
            {error && (
              <div className="error-message">
                <p>{error}</p>
                <Button onClick={fetchAppointments}>Try Again</Button>
              </div>
            )}

            {appointments.length === 0 ? (
              <div className="no-appointments">
                <p>No upcoming appointments scheduled.</p>
              </div>
            ) : (
              <div className="appointments-list">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="appointment-item">
                    <div className="appointment-info">
                      <div className="appointment-header">

                        <h3>Meeting with Prof. {facultyInfo[appointment.faculty_id]?.last_name}</h3>
                        <span className="appointment-date">
                          {formatDate(appointment.date)}
                        </span>
                      </div>
                      <div className="appointment-time">
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </div>
                      <div className="appointment-reason">
                        <strong>Reason:</strong> {appointment.reason}
                      </div>
                      {appointment.checked_in && (
                        <div className="checked-in-status">✓ Checked In</div>
                      )}
                    </div>
                    <div className="button-group-apt">
                      <Button
                        onClick={() => handleCheckin(appointment.id)}
                        className={`check-in-button ${canCheckIn(appointment) !== 'ready' ? 'disabled' : ''}`}
                        disabled={checkingInId === appointment.id || canCheckIn(appointment) !== 'ready'}
                      >
                        {checkingInId === appointment.id ? 'Checking in...' : 
                        canCheckIn(appointment) === 'checked' ? '✓ Checked In' : 
                        'Check In'}
                      </Button>
                      <Button
                        onClick={() => handleReschedule(appointment)}
                        className="check-in-button"
                        disabled={deletingId === appointment.id}
                      >
                        Reschedule
                      </Button>
                      <Button
                        onClick={() => handleDelete(appointment.id)}
                        className="cancel-button"
                        disabled={deletingId === appointment.id}
                      >
                        {deletingId === appointment.id ? 'Canceling...' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="appointments-section">
            <Button
              onClick={() => setShowPastAppointments(!showPastAppointments)}
              className="toggle-past-button"
            >
              {showPastAppointments ? 'Hide Past Appointments' : 'Show Past Appointments'}
            </Button>

            {showPastAppointments && pastAppointments.length > 0 && (
              <div className="past-appointments-container">
                <h3>Past Appointments</h3>
                <div className="appointments-list">
                  {pastAppointments.map((appointment) => (
                    <div 
                      key={appointment.id} 
                      className="appointment-item past-appointment"
                    >
                      <div className="appointment-info">
                        <div className="appointment-header">
                          <h3>Meeting with Prof. {facultyInfo[appointment.faculty_id]?.last_name}</h3>
                          <span className="appointment-date">
                            {formatDate(appointment.date)}
                          </span>
                        </div>
                        <div className="appointment-time">
                          {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                        </div>
                        <div className="appointment-reason">
                          <strong>Reason:</strong> {appointment.reason}
                        </div>
                        {appointment.checked_in && (
                          <div className="checked-in-status">✓ Checked In</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="fixed-button-container">
            <Button onClick={() => navigate('/home')} className="back-button">
              Back to Home
            </Button>
          </div>
          <LogoutButton/>
        </div>
      </div>

      {isReviewModalOpen && selectedAppointment && (
        <div className="review-modal-page">
          <ReviewModal
            onClose={() => {
              setIsReviewModalOpen(false);
              setSelectedAppointment(null);
              resetSchedulingState();
            }}
            facultyName={facultyInfo[selectedAppointment.faculty_id]?.last_name}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            reason={reason}
            duration={selectedDuration}
            onConfirm={handleConfirmReschedule}
            isLoading={loading}
            meetingDurations={meetingDurations}
            availableTimes={availableTimes}
            blockedTimeSlots={blockedTimeSlots}
            facultyId={selectedAppointment.faculty_id}
            onUpdateDate={handleUpdateDate}
            onUpdateTime={handleUpdateTime}
            onUpdateReason={handleUpdateReason}
            onUpdateDuration={handleUpdateDuration}
            isRescheduling={true}
            predefinedMessages={predefinedMessages}
            calendarProps={{
              selectedDate,
              onSelectDate: handleDateTimeSelect,
              facultyId: selectedAppointment.faculty_id,
              blockedTimeSlots,
              availableTimes
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ViewMeetings;