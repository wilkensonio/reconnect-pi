import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';  
import { MemoryRouter } from 'react-router-dom';
import Calendar from '../components/Calendar';
import { AppProvider } from '../context/AppContext'; // Adjust the import path as necessary

beforeAll(() => {
  global.import = {
    meta: {
      env: {
        VITE_APP_API_KEY: 'mock_api_key'
      }
    }
  };
});


test('renders Calendar component', () => {
  render(
    <MemoryRouter>
      <AppProvider>
        <Calendar />
      </AppProvider>
    </MemoryRouter>
  );
  const linkElement = screen.getByText(/Month/i); 
  expect(linkElement).toBeInTheDocument();
});

