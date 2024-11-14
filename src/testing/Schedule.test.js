import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';  
import { MemoryRouter } from 'react-router-dom';
import Schedule from '../components/Schedule';
import { AppProvider } from '../context/AppContext'; // Adjust the import path as necessary
import logoSrc from '/rcnnct.png';

beforeAll(() => {
    global.import = {
      meta: {
        env: {
          VITE_APP_API_KEY: 'mock_api_key'
        }
      }
    };
  });
  
jest.mock('/rcnnct.png', () => 'test-file-stub');

test('should load logo', () => {
  expect(logoSrc).toBe('test-file-stub');
});

test('renders Schedule component', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Schedule />
        </AppProvider>
      </MemoryRouter>
    );

  });
  