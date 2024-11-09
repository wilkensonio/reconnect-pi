import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FacultySelection from '../components/FacultySelection';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';

// Mock services and dependencies
jest.mock('../services/api');
jest.mock('../context/AppContext', () => ({
  useAppContext: jest.fn(),
}));

// Mock assets and components
jest.mock('/rcnnct.png', () => 'mockLogoSrc');
jest.mock('../components/BackgroundLogos', () => () => <div data-testid="background-logos" />);
jest.mock('../components/Button', () => (props) => <button {...props} data-testid="button-mock">Mock Button</button>);
jest.mock('../styles/FacultySelection.css', () => {});

describe('FacultySelection Component', () => {
  beforeEach(() => {
    // Mock the user context
    useAppContext.mockReturnValue({ user: { name: 'Test User' } });

    // Mock the apiService response
    apiService.getAllFaculty.mockResolvedValue([
      {
        id: "70578617",
        user_id: "70578617",
        first_name: "J",
        last_name: "Escobar",
        title: "Professor",
        department: "Computer Science",
      },
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders FacultySelection with logoSrc image', async () => {
    render(
      <MemoryRouter>
        <FacultySelection />
      </MemoryRouter>
    );

    // Check if logo image is rendered with mock src
    const logoImage = screen.getByRole('img', { name: /background logo/i });
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', 'mockLogoSrc');
  });

  test('calls getAllFaculty API and allows faculty selection', async () => {
    render(
      <MemoryRouter>
        <FacultySelection />
      </MemoryRouter>
    );

    // Verify that the getAllFaculty API was called once
    expect(apiService.getAllFaculty).toHaveBeenCalledTimes(1);

    // Check that loading spinner appears initially
    expect(screen.getByText('Loading faculty members...')).toBeInTheDocument();

    // Wait for faculty data to load
    await waitFor(() => expect(screen.getByText(/Escobar, J/i)).toBeInTheDocument());

    // Verify faculty member's name appears
    const facultyButton = screen.getByRole('button', { name: /Escobar, J/i });
    expect(facultyButton).toBeInTheDocument();

    // Simulate selecting a faculty member
    fireEvent.click(facultyButton);

    // Check if the faculty ID is stored in sessionStorage
    expect(sessionStorage.getItem('selected_faculty_id')).toBe("70578617");

    // Check that BackgroundLogos and Button are rendered
    expect(screen.getByTestId('background-logos')).toBeInTheDocument();
    expect(screen.getByTestId('button-mock')).toBeInTheDocument();
  });
});
