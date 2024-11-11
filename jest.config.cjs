

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
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  }, 

  setupFilesAfterEnv:  ['@testing-library/jest-dom'],
  
};

