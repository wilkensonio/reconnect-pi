import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import FacultySelection from '../components/FacultySelection';
import { apiService } from '../services/api';
import { AppProvider } from '../context/AppContext';

beforeAll(() => {
  global.import = {
    meta: {
      env: {
        VITE_APP_API_KEY: 'mock_api_key', 
      },
    },
  };
});

jest.mock('../services/api');
jest.mock('../context/AppContext');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn()
}));

test('renders FacultySelection component', () => {
  render(
    <MemoryRouter>
      <AppProvider>
        <FacultySelection />
      </AppProvider>
    </MemoryRouter>
  );
  
});