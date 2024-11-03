import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
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

const ServerDisconnected = () => (
    <div className="fixed inset-0" 
         style={{ 
           zIndex: 9999,
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           backgroundColor: '#0051ca',
           pointerEvents: 'all',
           width: '1024px',
           height: '600px',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'space-between',
           padding: '0 60px'
         }}>
        {/* Left Side - Logo */}
        <div style={{ 
            flex: '0 0 auto',
        }}>
            <img 
                src="/CSC logo.png" 
                alt="CSC Logo" 
                style={{ 
                    width: '600px',
                    height: 'auto',
                    filter: 'brightness(1.2)',
                    opacity: '0.95'
                }}
            />
        </div>
        
        {/* Right Side - Messages */}
        <div style={{ 
            flex: '0 0 auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start'
        }}>
            <h2 style={{ 
                color: '#ffffff',
                fontSize: '32px',
                fontWeight: '500',
                marginBottom: '16px',
                fontFamily: 'Roboto, sans-serif',
                letterSpacing: '0.5px',
                textAlign: 'left'
            }}>
                Connection Lost
            </h2>
            <p style={{ 
                color: '#ffffff',
                fontSize: '18px',
                marginBottom: '20px',
                opacity: '0.9',
                fontFamily: 'Roboto, sans-serif',
                textAlign: 'left'
            }}>
                Unable to reach the server
            </p>
            <div style={{ 
                color: '#ffffff',
                fontSize: '16px',
                opacity: '0.8',
                animation: 'pulse 2s infinite',
                fontFamily: 'Roboto, sans-serif',
                textAlign: 'left'
            }}>
                Attempting to reconnect...
            </div>
        </div>
        <style>
            {`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
            `}
        </style>
    </div>
);

const ConnectionWrapper = ({ children }) => {
    const [isOnline, setIsOnline] = useState(true);
    const location = useLocation();

    useEffect(() => {
        let mounted = true;
        let checkInterval;
        let failedAttempts = 0;
        const MAX_FAILED_ATTEMPTS = 2;

        const checkConnection = async () => {
            if (!mounted) return;

            try {
                await fetch(`${window.location.origin}/`, {
                    method: 'HEAD',
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    }
                });
                
                if (mounted) {
                    setIsOnline(true);
                    failedAttempts = 0;
                }
            } catch (error) {
                if (!mounted) return;
                
                failedAttempts++;
                if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
                    setIsOnline(false);
                }
            }
        };

        const handleOnline = () => {
            if (mounted) {
                checkConnection();
            }
        };

        const handleOffline = () => {
            if (mounted) {
                setIsOnline(false);
            }
        };

        const handleError = (event) => {
            if (event.message?.includes('NetworkError') || 
                event.message?.includes('Failed to fetch') ||
                event.message?.includes('Network request failed')) {
                if (mounted) {
                    failedAttempts++;
                    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
                        setIsOnline(false);
                    }
                }
            }
        };

        checkConnection();
        checkInterval = setInterval(checkConnection, 1000);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleError);

        return () => {
            mounted = false;
            clearInterval(checkInterval);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleError);
        };
    }, [location]);

    if (!isOnline) {
        return <ServerDisconnected />;
    }

    return children;
};

const ProtectedRoute = ({ children }) => {
    const { user } = useAppContext();
    
    if (!user) {
        document.body.classList.add('logging-out');
        setTimeout(() => {
            document.body.classList.remove('logging-out');
        }, 500);
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
    const location = useLocation();

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

    const mainContent = showMessages && messages.length > 0 ? (
        <PiMessageModal 
            messages={messages} 
            onClose={() => setShowMessages(false)}
        />
    ) : (
        <Routes location={location}>
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

    return (
        <Suspense fallback={<Loading message="Loading..." />}>
            <div key={location.pathname} className="page-transition">
                {mainContent}
            </div>
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
                        <ConnectionWrapper>
                            <AppRoutes />
                        </ConnectionWrapper>
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