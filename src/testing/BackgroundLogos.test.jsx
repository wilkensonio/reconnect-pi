import React from 'react';
import { render, screen } from '@testing-library/react';
import BackgroundLogos from '../components/BackgroundLogos';
import useBackgroundLogos from '../hooks/useBackgroundLogos';

jest.mock('../hooks/useBackgroundLogos'); 
jest.mock('../styles/BackgroundLogos.css', () => ({}));

describe('BackgroundLogos Component', () => {
    const mockLogoData = [
        {size: 50, top: 20, left: 30, opacity: 0.8, rotation: 10}, 
        {size: 70, top: 50, left: 60, opacity: 0.5, rotation: 45}, 
    ]; 

    beforeEach(() => {
        useBackgroundLogos.mockReturnValue(mockLogoData);
    }); 

    test('renders background logos with correct image source and style', () => {
        const tlogoSrc = '/rcnnct.png'; 
        render(<BackgroundLogos logoSrc={tlogoSrc} />);
        const images = screen.getAllByAltText('background-logo');
        expect(images).toHaveLength(mockLogoData.length);

        images.forEach((img, index) => {
            expect(img).toHaveAttribute('src', tlogoSrc); 
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