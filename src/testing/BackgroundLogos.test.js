import React from 'react';
import { render, screen } from '@testing-library/react';
import BackgroundLogos from '../components/BackgroundLogos';
import useBackgroundLogos from '../hooks/useBackgroundLogos';
import '@testing-library/jest-dom';

// Mock the hook to control its return values during the test
jest.mock('../hooks/useBackgroundLogos');

describe('BackgroundLogos Component', () => {
  const logoSrc = 'test-logo.png';
  const mockLogos = [
    { size: 50, top: 10, left: 20, opacity: 0.8, rotation: 30 },
    { size: 75, top: 30, left: 50, opacity: 0.6, rotation: 45 },
  ];

  beforeEach(() => {
    useBackgroundLogos.mockReturnValue(mockLogos);
  });
  
  // Clear all mocks after each test to ensure no test interference
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test if the correct number of logo elements are rendered
  it('renders the correct number of logos', () => {
    render(<BackgroundLogos logoSrc={logoSrc} />);

    const renderedLogos = screen.getAllByAltText('background-logo');
    expect(renderedLogos).toHaveLength(mockLogos.length);
  });

  // Test if the correct styles are applied to each logo element
  it('applies the correct styles to each logo', () => {
    render(<BackgroundLogos logoSrc={logoSrc} />);

    const renderedLogos = screen.getAllByAltText('background-logo');

    // Loop through each logo and verify its style matches the mock data
    renderedLogos.forEach((logo, index) => {
      expect(logo).toHaveStyle(`width: ${mockLogos[index].size}px`);
      expect(logo).toHaveStyle(`top: ${mockLogos[index].top}%`);
      expect(logo).toHaveStyle(`left: ${mockLogos[index].left}%`);
      expect(logo).toHaveStyle(`opacity: ${mockLogos[index].opacity}`);
      expect(logo).toHaveStyle(`transform: translate(-50%, -50%) rotate(${mockLogos[index].rotation}deg)`);
    });
  });

    // Test if the correct image source is applied to each logo
  it('applies the correct src to each logo', () => {
    render(<BackgroundLogos logoSrc={logoSrc} />);

    const renderedLogos = screen.getAllByAltText('background-logo');
    renderedLogos.forEach((logo) => {
      expect(logo).toHaveAttribute('src', logoSrc);
    });
  });
});
