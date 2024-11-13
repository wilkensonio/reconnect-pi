import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import FacultySelection from '../components/FacultySelection';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';

beforeAll(() => {
  global.import = {
    meta: {
      env: {
        VITE_APP_API_KEY: 'mock_api_key', 
      },
    },
  };
});

jest.mock('../services/api');
jest.mock('../context/AppContext');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn()
}));

describe('FacultySelection Component', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue({ state: {} });
    jest.spyOn(window.localStorage.__proto__, 'getItem');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('displays sample data when there is no token', async () => {
    localStorage.getItem.mockReturnValue(null); // No token in localStorage
    useAppContext.mockReturnValue({ user: {} });

    render(
      <MemoryRouter>
        <FacultySelection />
      </MemoryRouter>
    );

    // Updated matcher to use `getByText` for flexible search
    expect(await screen.findByText('Escobar, J', { exact: false })).toBeInTheDocument();
  });

  test('displays sample data on 401 unauthorized error', async () => {
    localStorage.getItem.mockReturnValue('valid_token');
    apiService.getAllFaculty.mockRejectedValue({ response: { status: 401 } });
    useAppContext.mockReturnValue({ user: {} });

    render(
      <MemoryRouter>
        <FacultySelection />
      </MemoryRouter>
    );

    expect(await screen.findByText('Escobar, J', { exact: false })).toBeInTheDocument();
  });

  test('fetches faculty data when there is a valid token', async () => {
    const mockFacultyData = [
      { user_id: '123', first_name: 'John', last_name: 'Doe', title: 'Professor', department: 'Mathematics' },
    ];

    localStorage.getItem.mockReturnValue('valid_token');
    apiService.getAllFaculty.mockResolvedValue(mockFacultyData);
    useAppContext.mockReturnValue({ user: {} });

    render(
      <MemoryRouter>
        <FacultySelection />
      </MemoryRouter>
    );

    expect(await screen.findByText('Doe, John')).toBeInTheDocument();
  });

  test('redirects to login if no token or user when selecting faculty', async () => {
    localStorage.getItem.mockReturnValue(null);
    useAppContext.mockReturnValue({ user: null });

    render(
      <MemoryRouter>
        <FacultySelection />
      </MemoryRouter>
    );

    const button = await screen.findByText('Escobar, J', { exact: false });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('navigates to home when selecting faculty with valid token and user', async () => {
    localStorage.getItem.mockReturnValue('valid_token');
    useAppContext.mockReturnValue({ user: { name: 'Student' } });

    render(
      <MemoryRouter>
        <FacultySelection />
      </MemoryRouter>
    );

    const button = await screen.findByText('Escobar, J', { exact: false });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });
});
