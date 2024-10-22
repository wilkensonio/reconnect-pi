import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import Button from './Button';
import BackgroundLogos from './BackgroundLogos';
import LogoutButton from './LogoutButton';
import '../styles/ViewMeetings.css';
import logoSrc from '/rcnnct.png';

const ViewMeetings = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAppContext();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.student_id) {
        setError('Please log in again');
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.getStudentAppointments(user.student_id);
        const appointmentsWithDetails = await Promise.all(
          response.map(async (appointment) => {
            try {
              const facultyInfo = await apiService.getFacultyInfo(appointment.faculty_id);
              return {
                ...appointment,
                facultyName: `Prof. ${facultyInfo.last_name}`
              };
            } catch (error) {
              console.error(`Error fetching faculty info: ${error}`);
              return {
                ...appointment,
                facultyName: 'Unknown Faculty'
              };
            }
          })
        );

        // Sort appointments by date and time
        const sortedAppointments = appointmentsWithDetails.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.start_time}`);
          const dateB = new Date(`${b.date} ${b.start_time}`);
          return dateA - dateB;
        });

        setAppointments(sortedAppointments);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to load appointments');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await apiService.deleteAppointment(appointmentId);
        setAppointments(appointments.filter(app => app.id !== appointmentId));
      } catch (error) {
        console.error('Error canceling appointment:', error);
        alert('Failed to cancel appointment. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="view-meetings">
        <BackgroundLogos logoSrc={logoSrc} />
        <div className="meetings-container">
          <div className="meetings-card loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your appointments...</p>
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
          <h2>Your Meetings</h2>
          
          {error ? (
            <div className="error-message">{error}</div>
          ) : appointments.length === 0 ? (
            <div className="no-appointments">
              <p>No appointments scheduled</p>
            </div>
          ) : (
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-item">
                  <div className="appointment-header">
                    <h3>{appointment.facultyName}</h3>
                    <Button
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="cancel-button"
                    >
                      Cancel Meeting
                    </Button>
                  </div>
                  <div className="appointment-details">
                    <p>
                      <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p>
                      <strong>Time:</strong> {appointment.start_time} - {appointment.end_time}
                    </p>
                    <p>
                      <strong>Reason:</strong> {appointment.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="button-container">
            <Button
              onClick={() => navigate('/home')}
              className="back-button"
            >
              Back to Home
            </Button>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMeetings;