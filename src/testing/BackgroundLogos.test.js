import React from 'react';
import { render, screen } from '@testing-library/react';
import BackgroundLogos from '../components/BackgroundLogos';
import useBackgroundLogos from '../hooks/useBackgroundLogos';
import '@testing-library/jest-dom';

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the correct number of logos', () => {
    render(<BackgroundLogos logoSrc={logoSrc} />);

    const renderedLogos = screen.getAllByAltText('background-logo');
    expect(renderedLogos).toHaveLength(mockLogos.length);
  });

  it('applies the correct styles to each logo', () => {
    render(<BackgroundLogos logoSrc={logoSrc} />);

    const renderedLogos = screen.getAllByAltText('background-logo');

    renderedLogos.forEach((logo, index) => {
      expect(logo).toHaveStyle(`width: ${mockLogos[index].size}px`);
      expect(logo).toHaveStyle(`top: ${mockLogos[index].top}%`);
      expect(logo).toHaveStyle(`left: ${mockLogos[index].left}%`);
      expect(logo).toHaveStyle(`opacity: ${mockLogos[index].opacity}`);
      expect(logo).toHaveStyle(`transform: translate(-50%, -50%) rotate(${mockLogos[index].rotation}deg)`);
    });
  });

  it('applies the correct src to each logo', () => {
    render(<BackgroundLogos logoSrc={logoSrc} />);

    const renderedLogos = screen.getAllByAltText('background-logo');
    renderedLogos.forEach((logo) => {
      expect(logo).toHaveAttribute('src', logoSrc);
    });
  });
});
