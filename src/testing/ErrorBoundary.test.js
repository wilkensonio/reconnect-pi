import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';
import Button from '../components/Button';
import '@testing-library/jest-dom';

// Mocking the Button component to simplify testing and focus on ErrorBoundary behavior
jest.mock('../components/Button', () => (props) => (
  <button {...props}>{props.children}</button>
));

describe('ErrorBoundary Component', () => {
  // A child component that deliberately throws an error for testing purposes
  const ProblemChild = () => {
    throw new Error('Test error');
  };

  // Test to verify that ErrorBoundary catches errors and displays a fallback UI
  test('catches errors and displays fallback UI', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/we apologize for the inconvenience/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /return to home/i })).toBeInTheDocument();
  });
// Test to ensure that clicking the button resets the error state and redirects
  test('resets the error state and redirects on button click', () => {
    delete window.location;
    window.location = { href: jest.fn() };

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    const resetButton = screen.getByRole('button', { name: /return to home/i });
    fireEvent.click(resetButton);

    expect(window.location.href).toBe('/');
  });
});
