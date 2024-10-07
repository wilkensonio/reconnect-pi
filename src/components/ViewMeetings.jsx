import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import { apiService } from '../services/api';
import '../styles/ViewMeetings.css';
import logoSrc from '/rcnnct.png';

/**
 * ViewMeetings component for displaying and managing scheduled meetings
 */
const ViewMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        console.log('Fetching meetings');
        const data = await apiService.getAllMeetings();
        console.log('Fetched meetings:', data);
        setMeetings(data);
      } catch (error) {
        console.error('Error fetching meetings:', error);
        alert('Failed to fetch meetings. Please try again.');
      }
    };
    fetchMeetings();
  }, []);

  /**
   * Handle cancellation of a meeting
   * @param {string} id - The ID of the meeting to cancel
   */
  const handleCancel = async (id) => {
    try {
      console.log('Cancelling meeting:', id);
      await apiService.deleteMeeting(id);
      setMeetings(meetings.filter(meeting => meeting.id !== id));
      console.log('Meeting cancelled successfully');
      alert('Meeting cancelled successfully');
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      alert('Failed to cancel meeting. Please try again.');
    }
  };

  return (
    <div className="view-meetings">
      <BackgroundLogos logoSrc={logoSrc} />
      <div className="card meetings-list">
        <h2>View Meetings</h2>
        {meetings.map((meeting) => (
          <div key={meeting.id} className="meeting-item">
            <p>{new Date(meeting.date).toLocaleString()} - {meeting.reason}</p>
            <Button onClick={() => handleCancel(meeting.id)}>Cancel</Button>
          </div>
        ))}
        <Button onClick={() => {
          console.log('Navigating back to home');
          navigate('/');
        }} className="back-button">Back to Home</Button>
      </div>
    </div>
  );
};

export default ViewMeetings;