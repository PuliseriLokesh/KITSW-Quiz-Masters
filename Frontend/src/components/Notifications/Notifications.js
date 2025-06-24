import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.accessToken;

    // Debug logging
    console.log('Notifications component - User object:', user);
    console.log('Notifications component - Token:', token);

    // Test function to check authentication
    const testAuthentication = async () => {
        try {
            console.log('Testing authentication...');
            const response = await axios.get('http://localhost:7018/api/notifications/test', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Authentication test response:', response.data);
        } catch (error) {
            console.error('Authentication test failed:', error.response?.data || error.message);
        }
    };

    useEffect(() => {
        if (token) {
            console.log('Token found, fetching notifications...');
            testAuthentication(); // Test authentication first
            fetchNotifications();
            fetchUnreadCount();
        } else {
            console.log('No token found, setting error...');
            setError('No authentication token found. Please log in again.');
            setLoading(false);
        }
    }, [token]);

    const fetchNotifications = async () => {
        try {
            console.log('Making request to notifications endpoint with token:', token);
            
            const response = await axios.get('http://localhost:7018/api/notifications/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Notifications response:', response.data);
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            console.error('Error response:', error.response);
            console.error('Error request:', error.request);
            
            let errorMessage = 'Failed to fetch notifications';
            
            if (error.response) {
                // Server responded with error status
                console.error('Error status:', error.response.status);
                console.error('Error data:', error.response.data);
                
                if (error.response.status === 401) {
                    errorMessage = 'Authentication required. Please log in again.';
                } else if (error.response.status === 403) {
                    errorMessage = 'Access denied. You do not have permission to view notifications.';
                } else if (error.response.status === 404) {
                    errorMessage = 'Notifications endpoint not found.';
                } else {
                    errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
                }
            } else if (error.request) {
                // Request was made but no response received
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                // Something else happened
                errorMessage = `Error: ${error.message}`;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get('http://localhost:7018/api/notifications/user/count', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setUnreadCount(response.data);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`http://localhost:7018/api/notifications/${notificationId}/read`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Update the notification status locally
            setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, status: 'READ' }
                        : notification
                )
            );
            fetchUnreadCount(); // Refresh unread count
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('http://localhost:7018/api/notifications/user/read-all', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Update all notifications to read status locally
            setNotifications(prevNotifications =>
                prevNotifications.map(notification => ({
                    ...notification,
                    status: 'READ'
                }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        
        // Handle array format (LocalDateTime serialized as array)
        if (Array.isArray(dateTimeString)) {
            try {
                // Convert array format [year, month, day, hour, minute, second] to Date
                const [year, month, day, hour, minute, second] = dateTimeString;
                return new Date(year, month - 1, day, hour, minute, second || 0).toLocaleString();
            } catch (error) {
                console.error('Error parsing date array:', dateTimeString, error);
                return 'Invalid Date';
            }
        }
        
        // Handle string format
        try {
            const date = new Date(dateTimeString);
            if (isNaN(date.getTime())) {
                console.error('Invalid date string:', dateTimeString);
                return 'Invalid Date';
            }
            return date.toLocaleString();
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    if (loading) {
        return (
            <div className="notifications-container">
                <div className="loading">Loading notifications...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="notifications-container">
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="notifications-container">
                <div className="notifications-header">
                    <h2>Notifications</h2>
                    {unreadCount > 0 && (
                        <div className="unread-badge">{unreadCount}</div>
                    )}
                    {unreadCount > 0 && (
                        <button className="mark-all-read-btn" onClick={markAllAsRead}>
                            Mark All as Read
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="no-notifications">
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-item ${notification.status === 'UNREAD' ? 'unread' : 'read'}`}
                                onClick={() => notification.status === 'UNREAD' && markAsRead(notification.id)}
                            >
                                <div className="notification-content">
                                    <div className="notification-message">
                                        {notification.message}
                                    </div>
                                    <div className="notification-details">
                                        <span className="notification-time">
                                            {formatDateTime(notification.notificationTime)}
                                        </span>
                                        {notification.quizStartTime && (
                                            <span className="quiz-time">
                                                Quiz starts: {formatDateTime(notification.quizStartTime)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {notification.status === 'UNREAD' && (
                                    <div className="unread-indicator"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Notifications; 