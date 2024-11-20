module.exports = {
  moduleNameMapper: { //Is used to map module paths to specific locations or mock files.
    "^@/(.*)$": "<rootDir>/src/$1",
      // Maps CSS and SCSS imports to "identity-obj-proxy", which mocks CSS module imports for testing purposes.
     "\\.(css|scss)$": "identity-obj-proxy", 
     '\\.(png|jpg|jpeg|gif|bmp|svg)$': '<rootDir>/fileMock.js',
  },
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
};