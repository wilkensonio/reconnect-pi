module.exports = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
     "\\.(css|scss)$": "identity-obj-proxy", 
     '\\.(png|jpg|jpeg|gif|bmp|svg)$': '<rootDir>/fileMock.js',
  },
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
};