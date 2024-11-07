import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary'; // Adjust the import according to your folder structure

// Mock Button component
jest.mock('../components/Button', () => ({ onClick, children }) => (
  <button onClick={onClick}>{children}</button>
));
jest.mock('../styles/ErrorBoundary.css', () => ({}));


describe('ErrorBoundary', () => {
  test('renders child components', () => {
    render(
      <ErrorBoundary>
        <div>Child Component</div>
      </ErrorBoundary>
    );

    expect(screen.getByText(/child component/i)).toBeInTheDocument();
  });

  test('catches errors and displays fallback UI', () => {
    const ProblemChild = () => {
      throw new Error('Test Error');
    };

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/we apologize for the inconvenience/i)).toBeInTheDocument();
  });

  test('calls handleReset and navigates to home', () => {
    const ProblemChild = () => {
      throw new Error('Test Error');
    };

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    // Simulate clicking the "Return to Home" button
    fireEvent.click(screen.getByText(/return to home/i));

    // Check if window location changes
    expect(window.location.href).toBe('http://localhost/'); // Adjust based on your environment
  });
});
