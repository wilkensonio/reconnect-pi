import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickMessage from '../components/QuickMessage';
import { apiService } from '../services/api';

jest.mock('../services/api', () => ({
  sendQuickMessage: jest.fn(),
}));
//failed
describe('QuickMessage', () => {
  const mockOnClose = jest.fn();
  const mockMeetingId = '123';
  const mockMeeting = {
    _id: mockMeetingId,
    date: '2024-11-13T15:00:00', 
    reason: 'Test meeting',
  };

  test('renders correctly with message input and close button', () => {
    render(<QuickMessage meeting={mockMeeting} onClose={mockOnClose} />);

    screen.debug();

    expect(screen.getByPlaceholderText('Enter your message here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    expect(screen.getByText(`Quick message for meeting ${mockMeetingId}`)).toBeInTheDocument();
  });

  test('calls onClose when the close button is clicked', () => {
    render(<QuickMessage meeting={mockMeeting} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('handles message input and form submission', () => {
    render(<QuickMessage meeting={mockMeeting} onClose={mockOnClose} />);

    const messageInput = screen.getByPlaceholderText('Enter your message here');
    const submitButton = screen.getByRole('button', { name: /send message/i });

    fireEvent.change(messageInput, { target: { value: 'Test quick message' } });
    expect(messageInput.value).toBe('Test quick message');

    fireEvent.click(submitButton);
    expect(screen.getByText('Message Sent!')).toBeInTheDocument();
  });
});
