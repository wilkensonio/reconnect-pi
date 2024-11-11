import React from 'react';
import { render } from '@testing-library/react'; // Correct import for render
import '@testing-library/jest-dom'; // Import jest-dom for the matchers
import Loading from '../components/Loading';
import BackgroundLogos from '../components/BackgroundLogos'; // Make sure this import is correct

// Mock BackgroundLogos component
jest.mock('../components/BackgroundLogos', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mocked BackgroundLogos</div>),
}));

jest.mock('../styles/Loading.css', () => ({}));

describe('Loading Component', () => {
  it('renders without crashing and displays the default message', () => {
    const { getByText, container } = render(<Loading />);

    // Check if the default loading message is displayed
    expect(getByText('Loading...')).toBeInTheDocument();

    // Check if the loading spinner is present by className
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toBeInTheDocument();

    // Check if the BackgroundLogos component is rendered
    expect(getByText('Mocked BackgroundLogos')).toBeInTheDocument();
  });

  it('displays a custom message when provided', () => {
    const customMessage = 'Please wait...';
    const { getByText } = render(<Loading message={customMessage} />);

    // Check if the custom loading message is displayed
    expect(getByText(customMessage)).toBeInTheDocument();
  });

  it('renders the loading spinner', () => {
    const { container } = render(<Loading />);

    // Check if the loading spinner div is rendered
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toBeInTheDocument();
  });
});
