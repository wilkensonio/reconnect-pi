import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from '../components/Loading';
import BackgroundLogos from '../components/BackgroundLogos';
import '@testing-library/jest-dom';
import logoSrc from '/rcnnct.png';

// Mock the BackgroundLogos component to simplify testing and check if it renders correctly
jest.mock('../components/BackgroundLogos', () => (props) => (
  <div data-testid="background-logos" data-logo-src={props.logoSrc} />
));

describe('Loading Component', () => {
  // Test to verify if the BackgroundLogos component is rendered with the correct logo source
  test('renders BackgroundLogos with the correct logo source', () => {
    render(<Loading />);

    const backgroundLogos = screen.getByTestId('background-logos');
    expect(backgroundLogos).toBeInTheDocument();
    expect(backgroundLogos).toHaveAttribute('data-logo-src', logoSrc);
  });

  // Test to check if the default loading message ("Loading...") is displayed
  test('displays the default loading message', () => {
    render(<Loading />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  // Test to verify if a custom loading message is displayed when passed as a prop
  test('displays a custom loading message if provided', () => {
    const customMessage = 'Please wait...';
    render(<Loading message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});
