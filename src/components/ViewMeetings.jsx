import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import Button from './Button';
import '../styles/ViewMeetings.css';
import LogoutButton from './LogoutButton';

const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAppContext();

  useEffect(() => {
    const fetchAppointmentsAndFacultyInfo = async () => {
      if (!user || !user.student_id) {
        setError('User information is missing. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getStudentAppointments(user.student_id);
        
        const appointmentsWithFacultyNames = await Promise.all(
          response.map(async (appointment) => {
            try {
              const facultyInfo = await apiService.getFacultyInfo(appointment.faculty_id);
              return {
                ...appointment,
                facultyName: `${facultyInfo.last_name}`
              };
            } catch (error) {
              console.error(`Error fetching faculty info for ID ${appointment.faculty_id}:`, error);
              return {
                ...appointment,
                facultyName: 'Unknown'
              };
            }
          })
        );

        setAppointments(appointmentsWithFacultyNames);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to fetch appointments. Please try again later.');
        setLoading(false);
      }
    };

    fetchAppointmentsAndFacultyInfo();
  }, [user]);

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await apiService.deleteAppointment(appointmentId);
      setAppointments(appointments.filter(app => app.id !== appointmentId));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="view-appointments-container">
      <h2>Your Scheduled Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments scheduled.</p>
      ) : (
        <ul className="appointments-list">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="appointment-item">
              <h3>{appointment.reason}</h3>
              <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {appointment.start_time} - {appointment.end_time}</p>
              <p><strong>Faculty:</strong> {appointment.facultyName}</p>
              <Button onClick={() => handleDeleteAppointment(appointment.id)} className="cancel-button">
                Cancel Appointment
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Button onClick={() => navigate('/')} className="back-button">Back to Home</Button>
      <LogoutButton />
    </div>
  );
};

export default ViewAppointments;