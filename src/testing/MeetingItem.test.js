import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MeetingItem from '../components/MeetingItem'; 
import '@testing-library/jest-dom';

jest.mock('react-datepicker', () => ({ selected, onChange, showTimeSelect, dateFormat }) => (
  <div data-testid="date-picker" onClick={() => onChange(new Date('2024-11-13T15:00:00'))}>
    {selected ? 'November 13, 2024 3:00 PM' : ''}
  </div>
));

describe('MeetingItem Component', () => {
  test('renders DatePicker with the correct selected date', () => {
    const testDate = new Date('2024-11-13T15:00:00');
    render(<MeetingItem selectedDate={testDate} onSelectDate={jest.fn()} />);

    expect(screen.getByTestId('date-picker')).toHaveTextContent('November 13, 2024 3:00 PM');
  });

  test('calls onSelectDate when a new date is selected', () => {
    const mockOnSelectDate = jest.fn();
    render(<MeetingItem selectedDate={new Date('2024-11-13T15:00:00')} onSelectDate={mockOnSelectDate} />);

    fireEvent.click(screen.getByTestId('date-picker'));

    expect(mockOnSelectDate).toHaveBeenCalledWith(new Date('2024-11-13T15:00:00'));
  });
});
