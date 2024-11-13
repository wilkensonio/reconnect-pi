import React, { useState } from 'react';
import QuickMessage from './QuickMessage';

const MeetingItem = ({ meeting, onCancel }) => {
  const [showQuickMessage, setShowQuickMessage] = useState(false);

  return (
    <div className="meeting-item">
      <p>{new Date(meeting.date).toLocaleString()} - {meeting.reason}</p>
      <button onClick={() => onCancel(meeting._id)}>Cancel</button>
      <button onClick={() => setShowQuickMessage(true)}>Quick Message</button>
      {showQuickMessage && (
        <QuickMessage 
          meetingId={meeting._id} 
          onClose={() => setShowQuickMessage(false)} 
        />
      )}
    </div>
  );
};

export default MeetingItem;
