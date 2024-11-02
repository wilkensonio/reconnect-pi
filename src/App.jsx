import React, { useState, useEffect, Suspense, useMemo } from 'react';
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
import Loading from './components/Loading';
import './styles/App.css';

const MESSAGE_TIME_PREFIX = 'pi_message_time_';

const ProtectedRoute = ({ children }) => {
    const { user } = useAppContext();
    
    if (!user) {
        document.body.classList.add('logging-out');
        setTimeout(() => {
            document.body.classList.remove('logging-out');
        }, 500); // Changed to 1000ms for longer transition
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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const preserveStorage = () => {
            const preservedItems = {
                auth: {
                    token: localStorage.getItem('reconnect_access_token'),
                    facultyId: sessionStorage.getItem('selected_faculty_id')
                },
                messageTimings: {}
            };

            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(MESSAGE_TIME_PREFIX)) {
                    preservedItems.messageTimings[key] = localStorage.getItem(key);
                }
            });

            localStorage.clear();
            sessionStorage.clear();

            if (preservedItems.auth.token) {
                localStorage.setItem('reconnect_access_token', preservedItems.auth.token);
            }
            if (preservedItems.auth.facultyId) {
                sessionStorage.setItem('selected_faculty_id', preservedItems.auth.facultyId);
            }

            Object.entries(preservedItems.messageTimings).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });
        };

        preserveStorage();
    }, []);

    useEffect(() => {
        let mounted = true;
        const checkForMessages = async () => {
            try {
                const response = await apiService.getAllPiMessages();
                if (!mounted) return;
                
                if (response && Array.isArray(response) && response.length > 0) {
                    setMessages(prevMessages => {
                        if (JSON.stringify(prevMessages) !== JSON.stringify(response)) {
                            return response;
                        }
                        return prevMessages;
                    });
                } else {
                    setShowMessages(false);
                }
            } catch (error) {
                console.error('Error checking messages:', error);
                if (mounted) setShowMessages(false);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        checkForMessages();
        const messageInterval = setInterval(checkForMessages, 1000);
        
        return () => {
            mounted = false;
            clearInterval(messageInterval);
        };
    }, []);

    if (isLoading) {
        return <Loading message="Loading..." />;
    }

    return (
        <Suspense fallback={<Loading message="Loading..." />}>
            {showMessages && messages.length > 0 ? (
                <PiMessageModal 
                    messages={messages} 
                    onClose={() => setShowMessages(false)}
                />
            ) : (
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
            )}
        </Suspense>
    );
}

function App() {
    const [waitingWorker, setWaitingWorker] = useState(null);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.addEventListener('waiting', event => {
                    if (event.target.state === 'waiting') {
                        setWaitingWorker(event.target);
                    }
                });
            });
        }
    }, []);

    const updateServiceWorker = () => {
        waitingWorker?.postMessage('skipWaiting');
        window.location.reload();
    };

    return (
        <AppProvider>
            <Router>
                <div className="App">
                    <ErrorBoundary>
                        <AppRoutes />
                    </ErrorBoundary>
                    {waitingWorker && (
                        <div className="update-toast">
                            New version available!
                            <button onClick={updateServiceWorker}>
                                Update
                            </button>
                        </div>
                    )}
                </div>
            </Router>
        </AppProvider>
    );
}

export default App;