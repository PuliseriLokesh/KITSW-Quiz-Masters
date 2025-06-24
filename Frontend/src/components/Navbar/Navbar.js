import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../Home/logo.png';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.accessToken;

    useEffect(() => {
        if (token) {
            fetchUnreadCount();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [token]);

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch('http://localhost:7018/api/notifications/user/count', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const count = await response.json();
                setUnreadCount(count);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleNotificationClick = () => {
        navigate('/notifications');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="navbar-logo">
                    <img src={logo} alt="KITS Quiz Masters Logo" className="navbar-logo-image" />
                    KITS Quiz Masters
                </Link>
            </div>
            <ul className="navbar-links">
                <li>
                    <Link to="/dashboard" className="navbar-link">
                        Dashboard
                    </Link>
                </li>
                <li>
                    <Link to="/quizzes" className="navbar-link">
                        Quizzes
                    </Link>
                </li>
                <li>
                    <div className="notification-container">
                        <button 
                            className="notification-btn navbar-link"
                            onClick={handleNotificationClick}
                            title="Notifications"
                        >
                            🔔
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </button>
                    </div>
                </li>
                <li>
                    <button className="navbar-link navbar-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;