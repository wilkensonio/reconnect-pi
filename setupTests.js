import '@testing-library/jest-dom';

beforeAll(() => {
    // Mocking import.meta for the tests
    global.import = {
      meta: {
        env: {
          VITE_APP_API_KEY: 'mock_api_key' // Set a mock API key for testing
        },
      },
    };
  });