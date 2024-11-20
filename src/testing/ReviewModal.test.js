import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReviewModal from '../components/ReviewModal';
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

test('Renders ReviewModal Component', () => {
  render(
    <MemoryRouter>
      <AppProvider>
        <ReviewModal />
      </AppProvider>
    </MemoryRouter>
  );

});