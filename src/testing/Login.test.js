import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../components/Login';
import { apiService } from '../services/api';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext'; 

// Mock API key for testing purposes
beforeAll(() => {
  global.import = {
    meta: {
      env: {
        VITE_APP_API_KEY: 'mock_api_key'
      }
    }
  };
});

// Test case to ensure the Login component renders correctly
test('Renders Login Component', () => {
  render(
    <MemoryRouter>
      <AppProvider>
        <Login />
      </AppProvider>
    </MemoryRouter>
  );

});
