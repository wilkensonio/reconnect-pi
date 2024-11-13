// Import necessary modules
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../context/AppContext'; // Ensure this is the correct path to your AppProvider
import Schedule from '../components/Schedule'; // Replace with the actual path to your Schedule component

// Test to check if the Schedule component renders correctly
test('renders Schedule component', async () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['schedule']}>
          <Routes>
            <Route path="schedule" element={<Schedule />} />
          </Routes>
        </MemoryRouter>
      </AppProvider>
    );
  
    // Debug the rendered output to see what is displayed
    screen.debug(); // Check what is rendered
  
    // Example: Check if some specific text from your Schedule component is rendered
    const linkElement = await screen.findByText(/schedule/i); // Use the correct matching text
    expect(linkElement).toBeInTheDocument();
  });
  