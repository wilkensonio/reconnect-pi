import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import '../styles/ViewMeetings.css';

const ViewMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllMeetings();
      setMeetings(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      let errorMessage = 'Failed to fetch meetings. Please try again later.';
      if (error.message.includes('CORS error')) {
        errorMessage = 'CORS error: The server is not configured to allow requests from this origin. Please contact the backend team to resolve this issue.';
      } else if (error.response) {
        if (error.response.status === 500) {
          errorMessage = 'Internal Server Error. Please contact the backend team to investigate this issue.';
        } else if (error.response.status === 404) {
          errorMessage = 'The meetings endpoint was not found. Please check the API configuration.';
        } else {
          errorMessage = `Server responded with error ${error.response.status}: ${error.response.data.detail || error.response.statusText}`;
        }
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading meetings...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="view-meetings-container">
      <h2>Scheduled Meetings</h2>
      {meetings.length === 0 ? (
        <p>No meetings scheduled.</p>
      ) : (
        <ul className="meetings-list">
          {meetings.map((meeting) => (
            <li key={meeting.id} className="meeting-item">
              <h3>{meeting.title}</h3>
              <p>Date: {new Date(meeting.date).toLocaleDateString()}</p>
              <p>Time: {meeting.time}</p>
              <p>Location: {meeting.location}</p>
              <p>Participants: {meeting.participants.join(', ')}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViewMeetings;