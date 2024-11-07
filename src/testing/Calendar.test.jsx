import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';  // Remove /extend-expect
import Calendar from '../components/Calendar';
import { apiService } from '../__mocks__/api';  // Adjusted import path
import { AppContext } from '../context/AppContext';

jest.mock('../__mocks__/services/api');  // Adjusted path for mocking
jest.mock('../styles/Calendar.css', () => ({}));
jest.mock('react-datepicker/dist/react-datepicker.css', () => ({}));

// Mock data
const facultyId = 'faculty123';
const studentId = 'student456';
const mockAvailability = [
  { day: 'Monday', start_time: '09:00', end_time: '17:00' },
  { day: 'Tuesday', start_time: '09:00', end_time: '17:00' },
];
const mockFacultyAppointments = [
  { date: '2024-11-10', start_time: '10:00', end_time: '11:00' },
];
const mockStudentAppointments = [
  { date: '2024-11-10', start_time: '12:00', end_time: '13:00' },
];

describe('Calendar Component', () => {
  beforeEach(() => {
    apiService.getAvailabilitiesByUser.mockResolvedValue(mockAvailability);
    apiService.getAppointmentsByUser
      .mockImplementation((id) => {
        if (id === facultyId) return Promise.resolve(mockFacultyAppointments);
        if (id === studentId) return Promise.resolve(mockStudentAppointments);
        return Promise.resolve([]);  // Handle unexpected ID
      });
  });

  test('renders Calendar and fetches availability and appointments', async () => {
    // Mock context to provide `user` with `student_id`
    const mockContext = {
      user: { student_id: studentId },
    };

    render(
      <AppContext.Provider value={mockContext}>
        <Calendar selectedDate={new Date()} onSelectDate={() => {}} facultyId={facultyId} />
      </AppContext.Provider>
    );

    // Wait for availability and appointments to be set in the component
    await waitFor(() => {
      expect(apiService.getAvailabilitiesByUser).toHaveBeenCalledWith(facultyId);
      expect(apiService.getAppointmentsByUser).toHaveBeenCalledWith(facultyId);
      expect(apiService.getAppointmentsByUser).toHaveBeenCalledWith(studentId);
    });

    // Verify the presence of availability or appointments in the rendered component
    expect(screen.getByText(/select a date/i)).toBeInTheDocument();
  });

  test('allows selecting an available date and time slot', async () => {
    render(
      <Calendar selectedDate={new Date()} onSelectDate={() => {}} facultyId={facultyId} />
    );

    // Wait for availability to be rendered
    await waitFor(() => {
      expect(screen.getByText('Monday')).toBeInTheDocument();
    });

    // Trigger selection of an available date and time slot
    const availableDate = screen.getByText('Monday');
    fireEvent.click(availableDate);

    // You can expand this test to check if available times and duration selections are displayed correctly
    // For example, if the time slots are displayed after clicking the day, check for the times
    expect(screen.getByText('09:00')).toBeInTheDocument();
  });

  test('prevents selecting a time slot with conflicts', async () => {
    render(
      <Calendar selectedDate={new Date()} onSelectDate={() => {}} facultyId={facultyId} />
    );

    // Wait for appointments to be rendered
    await waitFor(() => {
      expect(screen.queryByText('10:00')).toBeInTheDocument();
    });

    const conflictTimeSlot = screen.queryByText('10:00'); // Conflicting with `mockFacultyAppointments`

    // Attempt to select a conflicting time
    if (conflictTimeSlot) fireEvent.click(conflictTimeSlot);

    // Expect error handling or message indicating conflict
    expect(screen.getByText(/selected duration conflicts/i)).toBeInTheDocument();
  });
});
