import React from 'react'; // Add this import
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewMeetings from '../components/ViewMeetings'; // Update with your actual path
import '@testing-library/jest-dom'; // For the 'toBeInTheDocument' matcher
import { BrowserRouter as Router } from 'react-router-dom'; // If your component uses routing

jest.mock('../services/api', () => ({
  fetchAppointments: jest.fn().mockResolvedValue([]),
}));

describe('ViewMeetings Component', () => {
  test('should render and display the meeting results modal on appointment submission', async () => {
    render(
      <Router>
        <ViewMeetings />
      </Router>
    );

    const submitButton = screen.getByText(/submit/i); 
    fireEvent.click(submitButton);

    await waitFor(() => {
      const modal = screen.getByRole('dialog'); 
      expect(modal).toBeInTheDocument();
      
      const meetingResults = screen.getByText(/Meeting with Prof\./); 
      expect(meetingResults).toBeInTheDocument();

      const appointmentDate = screen.getByText(/2024-11-13/); 
      expect(appointmentDate).toBeInTheDocument();
    });

    const confirmButton = screen.getByText(/Confirm/);
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Appointment confirmed/i)).toBeInTheDocument();
    });
  });
});
