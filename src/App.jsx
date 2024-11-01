import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { apiService } from './services/api';
import ErrorBoundary from './components/ErrorBoundary';
import FacultySelection from './components/FacultySelection';
import Home from './components/Home';
import Login from './components/Login';
import Schedule from './components/Schedule';
import ViewAppointments from './components/ViewMeetings';
import PiMessageModal from './components/PiMessageModal';
import './styles/App.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAppContext();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

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
  const [showMessages, setShowMessages] = useState(true);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const checkForMessages = async () => {
      try {
        const response = await apiService.getAllPiMessages();
        if (response && Array.isArray(response) && response.length > 0) {
          setMessages(response);
        } else {
          setShowMessages(false);
        }
      } catch (error) {
        console.error('Error checking messages:', error);
        setShowMessages(false);
      }
    };

    checkForMessages();
  }, []);

  if (showMessages && messages.length > 0) {
    return <PiMessageModal messages={messages} onClose={() => setShowMessages(false)} />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? <Navigate to="/select-faculty" replace /> : <Navigate to="/login" replace />
        }
      />
      <Route path="/login" element={<Login />} />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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