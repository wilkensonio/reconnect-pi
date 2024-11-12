import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReviewModal from '../components/ReviewModal';
//failed
const mockData = {
  facultyName: 'Escobar',  
  selectedDate: new Date(),
  selectedTime: '10:00',
  reason: 'Team retrospective',
  duration: '1 hour',
  isLoading: false,
  meetingDurations: [
    { label: '30 mins' },
    { label: '1 hour' },
    { label: '2 hours' },
  ],
  availableTimes: [
    { day: 'Monday', start_time: '09:00', end_time: '17:00' },
    { day: 'Tuesday', start_time: '09:00', end_time: '17:00' },
  ],
  blockedTimeSlots: [
    { date: '2024-11-11', start: '10:00' },
  ],
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  onUpdateReason: jest.fn(),
  onUpdateDuration: jest.fn(),
  onUpdateDate: jest.fn(),
  onUpdateTime: jest.fn(),
  facultyId: "70578617",
};

describe('ReviewModal', () => {
  it('should render correctly with provided data', () => {
    render(
      <MemoryRouter>
        <ReviewModal {...mockData} />
      </MemoryRouter>
    );

    expect(screen.getByText('Team retrospective')).toBeInTheDocument();
    expect(screen.getByText('Professor Escobar')).toBeInTheDocument(); 
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('should call onConfirm when the confirm button is clicked', () => {
    render(
      <MemoryRouter>
        <ReviewModal {...mockData} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Confirm')); 
    expect(mockData.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when the back button is clicked', () => { 
    render(
      <MemoryRouter>
        <ReviewModal {...mockData} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Back')); 
    expect(mockData.onClose).toHaveBeenCalledTimes(1);
  });
});
