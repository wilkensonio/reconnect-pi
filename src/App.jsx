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
    return <Navigate to="/login" replace />;
  }

  // For routes that need faculty selection
  if (['/schedule', '/home', '/view'].includes(window.location.pathname)) {
    const selectedFacultyId = sessionStorage.getItem('selected_faculty_id');
    if (!selectedFacultyId) {
      return <Navigate to="/select-faculty" replace />;
    }
  }

  return children;
};

function AppRoutes() {
  const { user } = useAppContext();

  return (
    <ErrorBoundary>
      <Routes>
        {/* Redirect root to login or faculty selection based on auth status */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/select-faculty" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/select-faculty"
          element={
            <ProtectedRoute>
              <FacultySelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view"
          element={
            <ProtectedRoute>
              <ViewAppointments />
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
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