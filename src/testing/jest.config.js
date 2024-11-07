// jest.config.js
export const testEnvironment = 'jsdom';
export const transform = {
    '^.+\\.jsx?$': 'babel-jest',
};
export const moduleFileExtensions = ['js', 'jsx', 'json', 'node'];
export const setupFilesAfterEnv = ['@testing-library/jest-dom'];
  