import React from 'react';
import { render, screen } from '@testing-library/react';
import BackgroundLogos from '../components/BackgroundLogos';
import useBackgroundLogos from '../hooks/useBackgroundLogos';
import '@testing-library/jest-dom'; // Correct import for jest-dom

// Mocking the custom hook and CSS import
jest.mock('../hooks/useBackgroundLogos'); 
jest.mock('../styles/BackgroundLogos.css', () => ({}));

describe('BackgroundLogos Component', () => {
    // Mock data to simulate the logo positions and styles
    const mockLogoData = [
        { size: 50, top: 20, left: 30, opacity: 0.8, rotation: 10 }, 
        { size: 70, top: 50, left: 60, opacity: 0.5, rotation: 45 }, 
    ]; 

    // Before each test, return the mock data from the hook
    beforeEach(() => {
        useBackgroundLogos.mockReturnValue(mockLogoData);
    }); 

    test('renders background logos with correct image source and style', () => {
        const logoSrc = '/rcnnct.png'; 
        
        // Render the component with the mocked logo source
        render(<BackgroundLogos logoSrc={logoSrc} />);
        
        // Get all images with the alt text 'background-logo'
        const images = screen.getAllByAltText('background-logo');
        
        // Assert the correct number of logos are rendered
        expect(images).toHaveLength(mockLogoData.length);

        // Assert each logo has the correct attributes and styles
        images.forEach((img, index) => {
            expect(img).toHaveAttribute('src', logoSrc); 
            expect(img).toHaveStyle({
                width: `${mockLogoData[index].size}px`,
                top: `${mockLogoData[index].top}%`,
                left: `${mockLogoData[index].left}%`,
                opacity: `${mockLogoData[index].opacity}`,
                transform: `translate(-50%, -50%) rotate(${mockLogoData[index].rotation}deg)`,
            });
        });
    });
});
