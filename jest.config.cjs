// jest.config.js
// module.exports = {
//   testEnvironment: "jsdom", // Ensure you use jsdom as the test environment
//   transform: {
//     "^.+\\.jsx?$": "babel-jest",
//   },
//   moduleFileExtensions: ["js", "jsx"],
//   setupFilesAfterEnv: [
//     "@testing-library/jest-dom",
//     "<rootDir>/setupTests.js" 
//   ],
//   globals: {
//     'import.meta': {
//       env: {
//         VITE_APP_API_KEY: 'mock_api_key'
//       }
//     }
//   }
// };

module.exports = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/fileMock.js',
  },
};

