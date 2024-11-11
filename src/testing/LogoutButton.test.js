// LogoutButton.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import LogoutButton from '../components/LogoutButton';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../services/api', () => ({
  apiService: {
    logout: jest.fn(),
  },
}));

jest.mock('../context/AppContext', () => ({
  useAppContext: jest.fn(),
}));

describe('LogoutButton', () => {
  it('calls logout and navigates to home page when clicked', async () => {
    const mockLogout = jest.fn();
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    useAppContext.mockReturnValue({ logout: mockLogout });
    apiService.logout.mockResolvedValueOnce();

    const { getByText } = render(<LogoutButton />);

    // Simulate a click on the "Logout" button
    fireEvent.click(getByText('Logout'));

    // Wait for the async calls to complete
    await waitFor(() => {
      // Check that apiService.logout was called
      expect(apiService.logout).toHaveBeenCalledTimes(1);

      // Check that the logout function from context was called
      expect(mockLogout).toHaveBeenCalledTimes(1);

      // Check that the navigate function was called with '/'
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles errors during logout gracefully', async () => {
    const mockNavigate = jest.fn();
    const mockLogout = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    useAppContext.mockReturnValue({ logout: mockLogout });
    apiService.logout.mockRejectedValueOnce(new Error('Logout failed'));

    // Mock console.error to track error logging
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

    const { getByText } = render(<LogoutButton />);

    // Simulate a click on the "Logout" button
    fireEvent.click(getByText('Logout'));

    // Wait for async code to finish
    await waitFor(() => {
      // Ensure navigate was not called if logout failed
      expect(mockNavigate).not.toHaveBeenCalled();

      // Check if the error was logged
      expect(consoleErrorMock).toHaveBeenCalledWith('Error during logout:', expect.any(Error));

      // Restore the original console.error
      consoleErrorMock.mockRestore();
    });
  });
});
