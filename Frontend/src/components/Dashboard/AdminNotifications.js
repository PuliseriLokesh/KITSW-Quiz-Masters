import {
    ArrowBack as ArrowBackIcon,
    Assignment as AssignmentIcon,
    CheckCircle as CheckCircleIcon,
    Delete as DeleteIcon,
    Notifications as NotificationsIcon,
    People as PeopleIcon,
    Reply as ReplyIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../Navbar/AdminNavbar';
import './AdminNotifications.css';

function AdminNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyDialog, setReplyDialog] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        fetchNotifications();
        document.body.classList.add('admin-page');
        return () => document.body.classList.remove('admin-page');
    }, []);

    const fetchNotifications = async () => {
        if (!user?.accessToken) return;
        
        try {
            setLoading(true);
            const response = await axios.get(
                'http://localhost:7018/api/admin/notification-system',
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` }
                }
            );
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setError('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = (notification) => {
        setSelectedNotification(notification);
        setReplyText('');
        setReplyDialog(true);
    };

    const handleReplySubmit = async () => {
        if (!replyText.trim()) return;

        try {
            setSubmitting(true);
            await axios.put(
                `http://localhost:7018/api/admin/notification-system/${selectedNotification.id}/reply`,
                { reply: replyText },
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` }
                }
            );
            
            setSuccess('Reply sent successfully');
            setReplyDialog(false);
            fetchNotifications(); // Refresh the list
        } catch (error) {
            console.error("Error sending reply:", error);
            setError('Failed to send reply');
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await axios.put(
                `http://localhost:7018/api/admin/notification-system/${notificationId}/read`,
                {},
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` }
                }
            );
            fetchNotifications();
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const handleDelete = async (notificationId) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) return;

        try {
            await axios.delete(
                `http://localhost:7018/api/admin/notification-system/${notificationId}`,
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` }
                }
            );
            fetchNotifications();
            setSuccess('Notification deleted successfully');
        } catch (error) {
            console.error("Error deleting notification:", error);
            setError('Failed to delete notification');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'REPORT':
                return <AssignmentIcon color="error" />;
            case 'CONTACT':
                return <PeopleIcon color="info" />;
            default:
                return <NotificationsIcon color="primary" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'REPORT':
                return 'error';
            case 'CONTACT':
                return 'info';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        
        // Handle array format (LocalDateTime serialized as array)
        if (Array.isArray(dateString)) {
            try {
                // Convert array format [year, month, day, hour, minute, second] to Date
                const [year, month, day, hour, minute, second] = dateString;
                return new Date(year, month - 1, day, hour, minute, second || 0).toLocaleString();
            } catch (error) {
                console.error('Error parsing date array:', dateString, error);
                return 'Invalid date';
            }
        }
        
        // Handle string format
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.error('Invalid date string:', dateString);
                return 'Invalid date';
            }
            return date.toLocaleString();
        } catch (error) {
            console.error('Error parsing date string:', dateString, error);
            return 'Invalid date';
        }
    };

    if (loading) {
        return (
            <Box className="admin-notifications-container">
                <AdminNavbar />
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <CircularProgress />
                    </Box>
                </Container>
            </Box>
        );
    }

    return (
        <Box className="admin-notifications-container">
            <AdminNavbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={0} sx={{ p: 3, backgroundColor: 'transparent' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                        <IconButton onClick={() => navigate('/admin-page')}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            Admin Notifications
                        </Typography>
                        <Chip 
                            label={`${notifications.length} notifications`} 
                            color="primary" 
                            variant="outlined"
                        />
                    </Box>

                    {/* Alerts */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                            {success}
                        </Alert>
                    )}

                    {/* Notifications List */}
                    {notifications.length === 0 ? (
                        <Card sx={{ textAlign: 'center', py: 4 }}>
                            <CardContent>
                                <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    No notifications found
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    New reports and contact messages will appear here
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <List>
                            {notifications.map((notification, index) => (
                                <React.Fragment key={notification.id || index}>
                                    <ListItem 
                                        sx={{ 
                                            mb: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            borderRadius: 2,
                                            boxShadow: 1,
                                            '&:hover': {
                                                boxShadow: 3
                                            }
                                        }}
                                    >
                                        <ListItemIcon>
                                            {getNotificationIcon(notification.type)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Typography variant="h6" component="span">
                                                        {notification.title || `${notification.type} Notification`}
                                                    </Typography>
                                                    <Chip 
                                                        label={notification.status} 
                                                        size="small" 
                                                        color={getNotificationColor(notification.type)}
                                                    />
                                                    {notification.status === 'UNREAD' && (
                                                        <Chip 
                                                            label="NEW" 
                                                            size="small" 
                                                            color="warning"
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                                        {notification.message}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                        From: {notification.senderName || 'Anonymous'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDate(notification.createdAt)}
                                                    </Typography>
                                                    {notification.reply && (
                                                        <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                                                            <Typography variant="subtitle2" color="primary">
                                                                Your Reply:
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {notification.reply}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            }
                                        />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {notification.status === 'UNREAD' && (
                                                <IconButton 
                                                    color="success" 
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    title="Mark as Read"
                                                >
                                                    <CheckCircleIcon />
                                                </IconButton>
                                            )}
                                            <IconButton 
                                                color="primary" 
                                                onClick={() => handleReply(notification)}
                                                title="Reply"
                                            >
                                                <ReplyIcon />
                                            </IconButton>
                                            <IconButton 
                                                color="error" 
                                                onClick={() => handleDelete(notification.id)}
                                                title="Delete"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </ListItem>
                                    {index < notifications.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Paper>
            </Container>

            {/* Reply Dialog */}
            <Dialog open={replyDialog} onClose={() => setReplyDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Reply to {selectedNotification?.type?.toLowerCase()} notification
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Original Message:
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                            {selectedNotification?.message}
                        </Typography>
                    </Box>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Your Reply"
                        fullWidth
                        multiline
                        rows={4}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Enter your reply..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReplyDialog(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleReplySubmit} 
                        variant="contained" 
                        disabled={!replyText.trim() || submitting}
                    >
                        {submitting ? <CircularProgress size={20} /> : 'Send Reply'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AdminNotifications; 