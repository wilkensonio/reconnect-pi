import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PiMessageModal from '../components/PiMessageModal';
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


test('Renders PiMessageModal Component', () => {
  render(
    <MemoryRouter>
      <AppProvider>
        <PiMessageModal />
      </AppProvider>
    </MemoryRouter>
  );

});
