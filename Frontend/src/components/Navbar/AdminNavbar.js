import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminNavbar.css";

function AdminNavbar() {
    const history = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        history("/");
    }

    const handleDashboardClick = () => {
        history("/Admin-page");
    }

    return (
        <nav className="admin-top-nav">
            <div className="admin-nav-content">
                <div className="admin-logo-section">
                    <button className="admin-dashboard-btn" onClick={handleDashboardClick}>
                        <h2>KITS Quiz Masters Admin Panel</h2>
                    </button>
                </div>
                <div className="admin-auth-buttons">
                    <button 
                        className="admin-logout-btn"
                        onClick={handleLogout}
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default AdminNavbar; 