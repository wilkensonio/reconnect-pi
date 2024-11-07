// Loading.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from '../components/Loading';
import BackgroundLogos from '../components/BackgroundLogos'; // Ensure the import is correct
import '@testing-library/jest-dom/extend-expect';

jest.mock('../styles/Loading.css', () => ({})); // Mocking the CSS for the component
jest.mock('../styles/BackgroundLogos.css', () => ({})); // Mocking CSS for BackgroundLogos

describe('Loading Component', () => {
  test('renders the loading message correctly', () => {
    render(<Loading />);
    const defaultMessage = screen.getByText('Loading...');
    expect(defaultMessage).toBeInTheDocument();
    
    const customMessage = 'Please wait';
    render(<Loading message={customMessage} />);
    const messageElement = screen.getByText(customMessage);
    expect(messageElement).toBeInTheDocument();
  });

  test('renders the background image from logoSrc', () => {
    const tlogoSrc = '/rcnnct.png'; // Path to the logo image
    
    render(<BackgroundLogos logoSrc={tlogoSrc} />);
    const backgroundLogo = screen.getByRole('img', { name: /background/i });
    
    // Ensure that the background logo has the correct src
    expect(backgroundLogo).toBeInTheDocument();
    expect(backgroundLogo).toHaveAttribute('src', tlogoSrc); // Check if it has the correct src attribute
  });

  test('renders the loading spinner', () => {
    render(<Loading />);
    const spinner = screen.getByRole('status'); // Assuming the spinner has role 'status'
    expect(spinner).toBeInTheDocument();
  });
});
