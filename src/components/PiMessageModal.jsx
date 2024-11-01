import React, { useState, useEffect } from 'react';
import Button from './Button';
import BackgroundLogos from './BackgroundLogos';
import { apiService } from '../services/api';
import '../styles/PiMessageModal.css';

const MESSAGE_TIME_PREFIX = 'pi_message_time_';

const PiMessageModal = ({ messages, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeMessages, setActiveMessages] = useState([]);

    const calculateExpiryTime = (startTime, duration, durationUnit) => {
        const expiryTime = new Date(startTime);
        
        switch (durationUnit) {
            case 'seconds':
                expiryTime.setSeconds(expiryTime.getSeconds() + duration);
                break;
            case 'minutes':
                expiryTime.setMinutes(expiryTime.getMinutes() + duration);
                break;
            case 'hours':
                expiryTime.setHours(expiryTime.getHours() + duration);
                break;
            case 'days':
                expiryTime.setDate(expiryTime.getDate() + duration);
                break;
            case 'weeks':
                expiryTime.setDate(expiryTime.getDate() + (duration * 7));
                break;
            case 'months':
                expiryTime.setMonth(expiryTime.getMonth() + duration);
                break;
            default:
                break;
        }
        return expiryTime;
    };

    // Initialize or update messages
    useEffect(() => {
        if (!messages || messages.length === 0) {
            setActiveMessages([]);
            return;
        }

        const processMessages = messages.map(message => {
            if (!message || !message.user_id) return null;

            const storageKey = `${MESSAGE_TIME_PREFIX}${message.user_id}`;
            let storedData = localStorage.getItem(storageKey);
            
            try {
                if (storedData) {
                    const { startTime, expiryTime } = JSON.parse(storedData);
                    return {
                        ...message,
                        startTime,
                        expiryTime
                    };
                } else {
                    const startTime = new Date().toISOString();
                    const expiryTime = calculateExpiryTime(
                        startTime,
                        message.duration,
                        message.duration_unit
                    ).toISOString();
                    
                    localStorage.setItem(storageKey, JSON.stringify({ startTime, expiryTime }));
                    
                    return {
                        ...message,
                        startTime,
                        expiryTime
                    };
                }
            } catch (error) {
                console.error('Error processing message:', error);
                return null;
            }
        }).filter(Boolean);

        setActiveMessages(processMessages);
        
        if (currentIndex >= processMessages.length) {
            setCurrentIndex(0);
        }
    }, [messages, currentIndex]);

    // Check for expired messages and handle deletion
    useEffect(() => {
        if (!activeMessages || activeMessages.length === 0) return;

        const checkAndDeleteExpiredMessages = async () => {
            const now = new Date();
            let hasChanges = false;
            
            const remainingMessages = activeMessages.filter(message => {
                if (!message || !message.expiryTime) return false;

                if (new Date(message.expiryTime) <= now) {
                    try {
                        apiService.deletePiMessage(message.user_id);
                        localStorage.removeItem(`${MESSAGE_TIME_PREFIX}${message.user_id}`);
                        hasChanges = true;
                        return false;
                    } catch (error) {
                        console.error('Error deleting message:', error);
                        return true;
                    }
                }
                return true;
            });

            if (hasChanges) {
                setActiveMessages(remainingMessages);
                if (currentIndex >= remainingMessages.length) {
                    setCurrentIndex(Math.max(0, remainingMessages.length - 1));
                }
            }

            if (remainingMessages.length === 0) {
                onClose();
            }
        };

        const interval = setInterval(checkAndDeleteExpiredMessages, 1000);
        return () => clearInterval(interval);
    }, [activeMessages, currentIndex, onClose]);

    const handleNext = () => {
        setCurrentIndex(prev => 
            prev === activeMessages.length - 1 ? prev : prev + 1
        );
    };

    const handlePrevious = () => {
        setCurrentIndex(prev => 
            prev === 0 ? prev : prev - 1
        );
    };

    if (!activeMessages || activeMessages.length === 0) {
        return null;
    }

    const currentMessage = activeMessages[currentIndex];
    if (!currentMessage) {
        return null;
    }

    return (
        <div className="message-page">
            <BackgroundLogos logoSrc="/rcnnct.png" />
            <div className="message-container">
                <div className="message-card">
                    <div className="message-content">
                        <h2>Important Messages</h2>
                        <div className="message-text-container">
                            {activeMessages.length > 1 && (
                                <button
                                    className="nav-button prev"
                                    onClick={handlePrevious}
                                    disabled={currentIndex === 0}
                                >
                                    ‹
                                </button>
                            )}
                            <div className="message-text">
                                <div className="message-info">
                                    <span className="message-from">
                                        From: {currentMessage.first_name} {currentMessage.last_name}
                                    </span>
                                </div>
                                {currentMessage.message}
                            </div>
                            {activeMessages.length > 1 && (
                                <button
                                    className="nav-button next"
                                    onClick={handleNext}
                                    disabled={currentIndex === activeMessages.length - 1}
                                >
                                    ›
                                </button>
                            )}
                        </div>
                        {activeMessages.length > 1 && (
                            <div className="message-pagination">
                                {activeMessages.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`pagination-dot ${index === currentIndex ? 'active' : ''}`}
                                        onClick={() => setCurrentIndex(index)}
                                    />
                                ))}
                            </div>
                        )}
                        <div className="message-footer">
                            <div className="message-counter">
                                {activeMessages.length > 1 && 
                                    `Message ${currentIndex + 1} of ${activeMessages.length}`
                                }
                            </div>
                            <Button
                                onClick={currentIndex === activeMessages.length - 1 ? onClose : handleNext}
                                className="login-button"
                            >
                                {currentIndex === activeMessages.length - 1 ? 'Continue to Login' : 'Next Message'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PiMessageModal;