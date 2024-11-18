import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
            backgroundColor: '#000612',
            backgroundImage: 'linear-gradient(135deg, #000612 0%, #001336 100%)',
            pointerEvents: 'all',
            width: '1024px',
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 60px',
            overflow: 'hidden',
            perspective: '1000px'
         }}>
        {/* Animated Background Elements */}
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            zIndex: 0
        }}>
            {/* Digital Circuit Lines */}
            <div style={{
                position: 'absolute',
                width: '150%',
                height: '150%',
                top: '-25%',
                left: '-25%',
                background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath stroke=\'%23003cff\' stroke-width=\'0.5\' fill=\'none\' d=\'M10 10h80v80h-80z\'/%3E%3C/svg%3E")',
                opacity: 0.1,
                animation: 'circuitFlow 20s linear infinite',
                transform: 'rotate(45deg)'
            }}/>
            
            {/* Glowing Particles */}
            {Array.from({ length: 50 }).map((_, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    width: '2px',
                    height: '2px',
                    background: '#00f7ff',
                    borderRadius: '50%',
                    boxShadow: '0 0 10px #00f7ff, 0 0 20px #00f7ff, 0 0 30px #00f7ff',
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `particle ${5 + Math.random() * 10}s linear infinite`
                }}/>
            ))}
            
            {/* Holographic Grid */}
            <div style={{
                position: 'absolute',
                width: '200%',
                height: '200%',
                top: '-50%',
                left: '-50%',
                background: 'linear-gradient(90deg, rgba(0,60,255,0.1) 1px, transparent 1px), linear-gradient(0deg, rgba(0,60,255,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                transform: 'perspective(500px) rotateX(60deg)',
                animation: 'gridMove 10s linear infinite'
            }}/>
        </div>

        {/* Left Side - Holographic Logo Display */}
        <div style={{
            flex: '0 0 400px',
            height: '400px',
            position: 'relative',
            transformStyle: 'preserve-3d',
            animation: 'holoRotate 15s ease-in-out infinite'
        }}>
            {/* Holographic Container */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'rgba(0, 60, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                border: '2px solid rgba(0, 247, 255, 0.3)',
                boxShadow: '0 0 30px rgba(0, 247, 255, 0.2)',
                animation: 'holoPulse 2s ease-in-out infinite'
            }}>
                {/* Scanning Effect */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #00f7ff, transparent)',
                    animation: 'scan 2s ease-in-out infinite'
                }}/>
                
                {/* Logo */}
                <img
                    src="/CSC logo.png"
                    alt="CSC Logo"
                    style={{
                        position: 'absolute',
                        width: '80%',
                        height: 'auto',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        filter: 'brightness(2) drop-shadow(0 0 10px rgba(0, 247, 255, 0.5))',
                        animation: 'logoFloat 4s ease-in-out infinite'
                    }}
                />
                
                {/* Holographic Glitch Effects */}
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0, 247, 255, 0.1)',
                        animation: `glitch ${0.2 + i * 0.1}s ease-in-out infinite alternate-reverse`,
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                        opacity: 0.5
                    }}/>
                ))}
            </div>
        </div>
        
        {/* Right Side - Futuristic Message Display */}
        <div style={{
            flex: '0 0 400px',
            height: '400px',
            background: 'rgba(0, 12, 36, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '2px solid rgba(0, 247, 255, 0.3)',
            boxShadow: '0 0 30px rgba(0, 247, 255, 0.1)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Message Content */}
            <div style={{
                padding: '40px',
                position: 'relative',
                zIndex: 2
            }}>
                <h2 style={{
                    color: '#00f7ff',
                    fontSize: '36px',
                    fontWeight: '600',
                    marginBottom: '20px',
                    fontFamily: 'Roboto, sans-serif',
                    textShadow: '0 0 10px rgba(0, 247, 255, 0.5)',
                    animation: 'textGlow 2s ease-in-out infinite'
                }}>
                    Connection Lost
                </h2>
                <p style={{
                    color: '#ffffff',
                    fontSize: '20px',
                    marginBottom: '24px',
                    fontFamily: 'Roboto, sans-serif',
                    textShadow: '0 0 5px rgba(0, 247, 255, 0.3)'
                }}>
                    Unable to reach the server
                </p>
                <div style={{
                    color: '#00f7ff',
                    fontSize: '18px',
                    animation: 'pulse 2s infinite',
                    fontFamily: 'Roboto, sans-serif',
                    textShadow: '0 0 5px rgba(0, 247, 255, 0.3)'
                }}>
                    Attempting to reconnect...
                </div>
            </div>
            
            {/* Diagnostic Data Animation */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60px',
                background: 'linear-gradient(0deg, rgba(0,247,255,0.1) 0%, transparent 100%)',
                borderTop: '1px solid rgba(0, 247, 255, 0.3)',
                padding: '10px',
                fontFamily: 'monospace',
                color: '#00f7ff',
                fontSize: '12px',
                animation: 'diagnostics 10s linear infinite'
            }}>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{
                        opacity: 0.7,
                        animation: `typewriter ${1 + i * 0.5}s steps(40) infinite`
                    }}>
                        {`> Attempting to establish connection... Retry ${i + 1}`}
                    </div>
                ))}
            </div>
        </div>
        
        <style>
            {`
                @keyframes circuitFlow {
                    0% { transform: rotate(45deg) translate(0, 0); }
                    100% { transform: rotate(45deg) translate(-100px, -100px); }
                }
                
                @keyframes particle {
                    0% { transform: translate(0, 0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translate(100px, -100px); opacity: 0; }
                }
                
                @keyframes gridMove {
                    0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
                    100% { transform: perspective(500px) rotateX(60deg) translateY(20px); }
                }
                
                @keyframes holoRotate {
                    0% { transform: rotateY(0deg); }
                    50% { transform: rotateY(15deg); }
                    100% { transform: rotateY(0deg); }
                }
                
                @keyframes holoPulse {
                    0% { box-shadow: 0 0 30px rgba(0, 247, 255, 0.2); }
                    50% { box-shadow: 0 0 50px rgba(0, 247, 255, 0.4); }
                    100% { box-shadow: 0 0 30px rgba(0, 247, 255, 0.2); }
                }
                
                @keyframes scan {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
                
                @keyframes logoFloat {
                    0% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.1); }
                    100% { transform: translate(-50%, -50%) scale(1); }
                }
                
                @keyframes glitch {
                    0% { transform: translate(0); }
                    20% { transform: translate(-2px, 2px); }
                    40% { transform: translate(-2px, -2px); }
                    60% { transform: translate(2px, 2px); }
                    80% { transform: translate(2px, -2px); }
                    100% { transform: translate(0); }
                }
                
                @keyframes textGlow {
                    0% { text-shadow: 0 0 10px rgba(0, 247, 255, 0.5); }
                    50% { text-shadow: 0 0 20px rgba(0, 247, 255, 0.8), 0 0 30px rgba(0, 247, 255, 0.5); }
                    100% { text-shadow: 0 0 10px rgba(0, 247, 255, 0.5); }
                }
                
                @keyframes diagnostics {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-100%); }
                }
                
                @keyframes typewriter {
                    from { width: 0; }
                    to { width: 100%; }
                }
                
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
    const [stopChecking, setStopChecking] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

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

        if (stopChecking) return;

        const checkForMessages = async () => {
            try {
                const response = await apiService.getAllPiMessages();
                if (!mounted || stopChecking) return;
                
                if (response && Array.isArray(response) && response.length > 0) {
                    setMessages(prevMessages => {
                        // Keep original comparison for deletion/expiry
                        if (JSON.stringify(prevMessages) !== JSON.stringify(response)) {
                            setShowMessages(true);  // Only set true when messages actually change
                            return response;
                        }
                        return prevMessages;
                    });
                } else {
                    setMessages([]);
                    setShowMessages(false);
                }
            } catch (error) {
                console.error('Error checking messages:', error);
                if (mounted) {
                    setMessages([]);
                    setShowMessages(false);
                }
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
    }, [stopChecking]);

    if (isLoading) {
        return <Loading message="Loading..." />;
    }

    const mainContent = showMessages && messages.length > 0 ? (
        <PiMessageModal 
            messages={messages} 
            onClose={() => {
                setStopChecking(true);
                setShowMessages(false);
                setMessages([]);
                if (!user) {
                    navigate('/login');
                }
            }}
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