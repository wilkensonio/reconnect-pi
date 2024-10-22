import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import FacultySelection from './components/FacultySelection';
import Home from './components/Home';
import Login from './components/Login';
import Schedule from './components/Schedule';
import ViewAppointments from './components/ViewMeetings';
import './styles/App.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAppContext();
  
  if (!user) {
    const currentPath = window.location.pathname;
    return <Navigate to="/login" replace state={{ from: currentPath }} />;
  }

  // Check if faculty is selected for relevant routes
  if (['/schedule', '/home'].includes(window.location.pathname)) {
    const selectedFacultyId = sessionStorage.getItem('selected_faculty_id');
    if (!selectedFacultyId) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<FacultySelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Home />
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/schedule" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Schedule />
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/view" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <ViewAppointments />
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;