import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import Calendar from '../components/Calendar';
import { apiService } from '../services/api';
import '@testing-library/jest-dom';

//failed
jest.mock('../services/api', () => ({
  apiService: {
    getAvailabilitiesByUser: jest.fn(),
    getAppointmentsByUser: jest.fn(),
  },
}));

test('should mark a time slot as unavailable if it conflicts with existing appointments', async () => {
  const mockOnSelectDate = jest.fn();

  const conflictingAppointment = {
    start_time: '2024-11-13T09:00:00',
    end_time: '2024-11-13T10:00:00',
  };

  apiService.getAvailabilitiesByUser.mockResolvedValue([
    { day: 'Tuesday', start_time: '09:00:00', end_time: '12:00:00' },
  ]);
  apiService.getAppointmentsByUser.mockResolvedValue([conflictingAppointment]);

  render(
    <AppProvider>
      <Calendar
        selectedDate={new Date('2024-11-13T11:00:00')}
        onSelectDate={mockOnSelectDate}
        facultyId="70578617"
      />
    </AppProvider>
  );

  const slot = await screen.findByRole('button', { name: /9:00/i });
  expect(slot).toHaveClass('unavailable');
  
  expect(unavailableSlot).toBeInTheDocument();

  fireEvent.click(unavailableSlot);
  expect(mockOnSelectDate).not.toHaveBeenCalled();
});
