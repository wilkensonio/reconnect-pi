import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Calendar from '../components/Calendar';
import { AppProvider } from '../context/AppContext';
import { apiService } from '../services/api';
import { act } from 'react-dom/test-utils';

jest.mock('../services/api');


const renderCalendar = (props) => {
  return render(
    <MemoryRouter>
      <AppProvider>
        <Calendar {...props} />
      </AppProvider>
    </MemoryRouter>
  );
};

describe('Calendar Component Tests', () => {
  const mockFacultyId = '12345';
  const mockUser = { student_id: '67890' };
  const mockAvailability = [
    { day: 'Monday', start_time: '09:00', end_time: '17:00' },
    { day: 'Tuesday', start_time: '09:00', end_time: '17:00' }
  ];
  const mockAppointments = [
    { date: '2024-11-20', start_time: '10:00', end_time: '11:00' }
  ];
  const mockStudentAppointments = [
    { date: '2024-11-20', start_time: '14:00', end_time: '15:00' }
  ];

  beforeEach(async () => {
    // Mock API calls for faculty and student appointments
    apiService.getAvailabilitiesByUser.mockResolvedValue(mockAvailability);
    apiService.getAppointmentsByUser.mockResolvedValueOnce(mockAppointments);
    apiService.getAppointmentsByUser.mockResolvedValueOnce(mockStudentAppointments);
  });

  test('renders Calendar component', () => {
    renderCalendar();
    const linkElement = screen.getByText(/Month/i);
    expect(linkElement).toBeInTheDocument();
  });

  test('fetches and displays availability based on facultyId', async () => {
    await act(async () => {
      renderCalendar({ facultyId: mockFacultyId });
    });
    expect(apiService.getAvailabilitiesByUser).toHaveBeenCalledWith(mockFacultyId);
    expect(apiService.getAppointmentsByUser).toHaveBeenCalledWith(mockFacultyId);
  });
  
});

describe('Calendar Appointment Conflict Tests', () => {
  const mockAppointments = [
    { date: '2024-11-20', start_time: '10:00', end_time: '11:00' }
  ];
  
  const mockStudentAppointments = [
    { date: '2024-11-20', start_time: '14:00', end_time: '15:00' }
  ];

  const runConflictCheck = (date, startTime, endTime) => {
    const dateString = date.toISOString().split('T')[0];
    const selectedTime = new Date(`${dateString}T${startTime}`);
    const endTimeObj = new Date(`${dateString}T${endTime}`);

    // Check for conflicts with faculty appointments
    const hasFacultyConflict = mockAppointments.some(apt => {
      if (apt.date !== dateString) return false;
      const aptStart = new Date(`${apt.date}T${apt.start_time}`);
      const aptEnd = new Date(`${apt.date}T${apt.end_time}`);
      return (selectedTime < aptEnd && endTimeObj > aptStart);
    });

    // Check for conflicts with student appointments
    const hasStudentConflict = mockStudentAppointments.some(apt => {
      if (apt.date !== dateString) return false;
      const aptStart = new Date(`${apt.date}T${apt.start_time}`);
      const aptEnd = new Date(`${apt.date}T${apt.end_time}`);
      return (selectedTime < aptEnd && endTimeObj > aptStart);
    });

    return hasFacultyConflict || hasStudentConflict;
  };

  test('detects conflict with a faculty appointment', async () => {
    const conflict = runConflictCheck(new Date('2024-11-20'), '10:30', '11:30');
    expect(conflict).toBe(true);
  });

  test('detects conflict with a student appointment', async () => {
    const conflict = runConflictCheck(new Date('2024-11-20'), '13:30', '14:30');
    expect(conflict).toBe(true);
  });

  test('detects no conflict when times are clear', async () => {
    const conflict = runConflictCheck(new Date('2024-11-20'), '15:30', '16:30');
    expect(conflict).toBe(false);
  });
});