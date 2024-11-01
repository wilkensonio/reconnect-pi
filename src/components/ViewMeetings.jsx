import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import '../styles/ViewMeetings.css';
import logoSrc from '/rcnnct.png';
import LogoutButton from './LogoutButton';

const ViewMeetings = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facultyInfo, setFacultyInfo] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [checkingInId, setCheckingInId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAppContext();

  const fetchFacultyInfo = async (facultyId) => {
    try {
      const info = await apiService.getFacultyInfo(facultyId);
      return info;
    } catch (error) {
      console.error(`Error fetching faculty info for ID ${facultyId}:`, error);
      return null;
    }
  };

  const getLocalDateTime = (dateString, timeString = '00:00') => {
    const [year, month, day] = dateString.split('-').map(Number);
    const [hours, minutes] = timeString.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  };

  const fetchAppointments = async () => {
    if (!user?.student_id) return;

    try {
      setLoading(true);
      const appointmentsResponse = await apiService.getAppointmentsByUser(user.student_id);
      
      // Filter out past appointments
      const now = new Date();
      const futureAppointments = appointmentsResponse.filter(apt => {
        const appointmentDateTime = new Date(`${apt.date}T${apt.start_time}`);
        return appointmentDateTime > now;
      });

      // Sort appointments by date and time
      const sortedAppointments = futureAppointments.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.start_time}`);
        const dateB = new Date(`${b.date}T${b.start_time}`);
        return dateA - dateB;
      });

      // Get faculty info for all appointments
      const uniqueFacultyIds = [...new Set(sortedAppointments.map(apt => apt.faculty_id))];
      const facultyInfoMap = {};
      
      await Promise.all(
        uniqueFacultyIds.map(async (facultyId) => {
          const info = await fetchFacultyInfo(facultyId);
          if (info) {
            facultyInfoMap[facultyId] = info;
          }
        })
      );

      setFacultyInfo(facultyInfoMap);
      setAppointments(sortedAppointments);
      console.log('Fetched Appointments:', sortedAppointments); // Add this line

      setError(null);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

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

  const canCheckIn = (appointment) => {
    const appointmentDateTime = getLocalDateTime(appointment.date, appointment.start_time);
    const now = new Date();
    const checkInWindow = new Date(appointmentDateTime.getTime() - 15 * 60000); // 15 minutes before
    return now >= checkInWindow && !appointment.checked_in;
  };

  const formatDate = (dateString) => {
    console.log('Formatting Date:', dateString);

    const date = getLocalDateTime(dateString);
    console.log('Parsed Date Object:', date);

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

  const getFacultyName = (facultyId) => {
    const faculty = facultyInfo[facultyId];
    return faculty ? `Prof. ${faculty.last_name}` : 'Faculty Member';
  };

  if (loading) {
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
                        <h3>Meeting with {getFacultyName(appointment.faculty_id)}</h3>
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
                    <div className="button-group">
                      {/*canCheckIn(appointment) && ( */}
                        <Button
                          onClick={() => handleCheckin(appointment.id)}
                          className="check-in-button"
                          disabled={checkingInId === appointment.id}
                        >
                          {checkingInId === appointment.id ? 'Checking in...' : 'Check In'}
                        </Button>
                      {/*)} */}
                      <Button
                        onClick={() => handleDelete(appointment.id)}
                        className="delete-button"
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

          <div className="fixed-button-container">
            <Button onClick={() => navigate('/home')} className="back-button">
              Back to Home
            </Button>
          </div>
          <LogoutButton/>
        </div>
      </div>
    </div>
  );
};

export default ViewMeetings;