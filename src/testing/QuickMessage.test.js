import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickMessage from '../components/QuickMessage';
import { apiService } from '../services/api';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext'; 

beforeAll(() => {
  global.import = {
    meta: {
      env: {
        VITE_APP_API_KEY: 'mock_api_key'
      }
    }
  };
});


jest.mock('../services/api', () => ({
  sendQuickMessage: jest.fn(),
}));

test('Renders ViewMeetings Component', () => {
  render(
    <MemoryRouter>
      <AppProvider>
        <QuickMessage />
      </AppProvider>
    </MemoryRouter>
  );

});
