import React from 'react';
import { render, screen } from '@testing-library/react';
import QuickMessage from '../components/QuickMessage';
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

test('Renders QuickMessage Component', () => {

  render(
    <MemoryRouter>
      <AppProvider>
        <QuickMessage/>
      </AppProvider>
    </MemoryRouter>
  );

});
