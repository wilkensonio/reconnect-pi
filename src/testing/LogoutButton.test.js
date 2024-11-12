import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import LogoutButton from '../components/LogoutButton';
import { MemoryRouter } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import '@testing-library/jest-dom';

beforeAll(() => {
  global.import = {
    meta: {
      env: {
        VITE_APP_API_KEY: 'mock_api_key', 
      },
    },
  };
});

jest.mock('../services/api', () => ({
  apiService: {
    logout: jest.fn(),
  },
}));

jest.mock('../context/AppContext', () => ({
  useAppContext: jest.fn(),
}));

jest.mock('../components/Button', () => ({ onClick, className, children }) => (
  <button onClick={onClick} className={className}>{children}</button>
));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('LogoutButton Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('logs the user out and navigates to the homepage on button click', async () => {
    const mockLogout = jest.fn();
    const mockNavigate = jest.fn();
    useAppContext.mockReturnValue({ logout: mockLogout });
    apiService.logout.mockResolvedValueOnce({});
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <LogoutButton />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(apiService.logout).toHaveBeenCalledTimes(1);
    });
  });

  it('handles errors during logout', async () => {
    const mockLogout = jest.fn();
    const mockNavigate = jest.fn();
    const mockError = new Error('Logout failed');
    useAppContext.mockReturnValue({ logout: mockLogout });
    apiService.logout.mockRejectedValueOnce(mockError);
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <LogoutButton />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(mockLogout).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(apiService.logout).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error during logout:', mockError);
    });

    consoleErrorSpy.mockRestore();
  });
});
