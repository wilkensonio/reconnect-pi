import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';  
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext'; // Adjust the import path as necessary
import logoSrc from '/rcnnct.png';
import ViewMeetings from '../components/ViewMeetings';

jest.mock('/rcnnct.png', () => 'test-file-stub');

test('should load logo', () => {
  expect(logoSrc).toBe('test-file-stub');
});

beforeAll(() => {
    global.import = {
      meta: {
        env: {
          VITE_APP_API_KEY: 'mock_api_key'
        }
      }
    };
  });
  


test('renders ViewMeetings component', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <ViewMeetings />
        </AppProvider>
      </MemoryRouter>
    );

  });
  