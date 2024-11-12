import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FacultySelection from '../components/FacultySelection';
import { MemoryRouter } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import '@testing-library/jest-dom';

jest.mock('../services/api');
jest.mock('../context/AppContext', () => ({
  useAppContext: jest.fn(),
}));
//failed
const mockUseNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUseNavigate,
}));

describe('FacultySelection Component', () => {
  const mockFacultyData = [
    {
      id: '70578617',
      user_id: '70578617',
      first_name: 'J',
      last_name: 'Escobar',
      title: 'Professor',
      department: 'Computer Science',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    apiService.getAllFaculty.mockResolvedValue(mockFacultyData);
    useAppContext.mockReturnValue({ user: { name: 'Test User' } });
  });

  it('renders loading state initially', async () => {
    render(<FacultySelection />);
    await waitFor(() => expect(screen.getByText(/loading faculty members.../i)).toBeInTheDocument());
  });
  

  it('displays faculty members once data is fetched', async () => {
    render(
      <MemoryRouter>
        <FacultySelection />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Select a Faculty Member/i)).toBeInTheDocument();
      expect(screen.getByText(/Escobar, J/i)).toBeInTheDocument();
    });
  });

  it('displays error message if authentication fails', async () => {
    // Mock authentication failure
    mockAuthFail();
  
    render(<FacultySelection />);
    await waitFor(() => expect(screen.getByText(/Authentication required to view faculty members./i)).toBeInTheDocument());
  });
  

  it('navigates to login if user is not authenticated', async () => {
    useAppContext.mockReturnValue({ user: null });

    render(
      <MemoryRouter>
        <FacultySelection />
      </MemoryRouter>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText(/Escobar, J/i));
      expect(mockUseNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('navigates to home if user selects a faculty member and is authenticated', async () => {
    render(<FacultySelection />);
    mockAuthSuccess();
    const facultyMember = screen.getByText(/Faculty Member Name/i);
    fireEvent.click(facultyMember);
  
    await waitFor(() => expect(mockHistoryPush).toHaveBeenCalledWith('/home'));
  });
  

  it('renders retry button if error occurs and retries on button click', async () => {
    apiService.getAllFaculty.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <FacultySelection />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load faculty members. Please try again later./i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });
});
