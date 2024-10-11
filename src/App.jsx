import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './components/Home';
import Login from './components/Login';
import Schedule from './components/Schedule';
import ViewMeetings from './components/ViewMeetings';
import './styles/App.css';

/**
 * Main App component
 * Sets up routing and wraps the application in the AppProvider for global state management
 */
function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/view" element={<ViewMeetings />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;