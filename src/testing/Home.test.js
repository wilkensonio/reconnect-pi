import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../components/Home'; // Adjust the import path as needed
import { apiService } from '../services/api'; // Mock the apiService
import { AppProvider } from '../context/AppContext'; 

jest.mock('../services/api', () => ({
  apiService: {
    getFacultyInfo: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate, // 
}));

beforeAll(() => {
  global.import = {
    meta: {
      env: {
        VITE_APP_API_KEY: 'mock_api_key', 
      },
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks(); 
});

describe('Home component', () => {
  test('renders correctly and navigates based on facultyId', async () => {
    const mockFacultyInfo = { last_name: 'Smith' };
    apiService.getFacultyInfo.mockResolvedValue(mockFacultyInfo);
    
    sessionStorage.setItem('selected_faculty_id', '70578617');

    render(
      <MemoryRouter>
        <AppProvider>
          <Home />
        </AppProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Prof. Smith's Office/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Schedule Meeting/)).toBeInTheDocument();
    expect(screen.getByText(/View Meetings/)).toBeInTheDocument();
    expect(screen.getByText(/Change Faculty Member/)).toBeInTheDocument();
    expect(screen.getByText(/Logout/)).toBeInTheDocument();
  });

  test('redirects when no facultyId is found', async () => {
    sessionStorage.removeItem('selected_faculty_id');

    render(
      <MemoryRouter>
        <AppProvider>
          <Home />
        </AppProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  test('navigates to schedule page on button click', async () => {
    const mockFacultyInfo = { last_name: 'Smith' };
    apiService.getFacultyInfo.mockResolvedValue(mockFacultyInfo);
    
    sessionStorage.setItem('selected_faculty_id', '70578617');

    render(
      <MemoryRouter>
        <AppProvider>
          <Home />
        </AppProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Schedule Meeting/));

    expect(mockNavigate).toHaveBeenCalledWith('/schedule');
  });

  test('handles faculty change and redirects', async () => {
    const mockFacultyInfo = { last_name: 'Smith' };
    apiService.getFacultyInfo.mockResolvedValue(mockFacultyInfo);
    
    sessionStorage.setItem('selected_faculty_id', '70578617');

    render(
      <MemoryRouter>
        <AppProvider>
          <Home />
        </AppProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Change Faculty Member/));

    expect(sessionStorage.getItem('selected_faculty_id')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
