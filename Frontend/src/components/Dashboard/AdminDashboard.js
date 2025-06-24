import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import QuizIcon from '@mui/icons-material/Quiz';
import {
    Badge,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import AdminNavbar from '../Navbar/AdminNavbar';
import './AdminDashboard.css';

function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [quizCount, setQuizCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const [pendingReports, setPendingReports] = useState(0);
    const [pendingContacts, setPendingContacts] = useState(0);

    // Fetch quiz count and notifications
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.accessToken) return;
            try {
                // Fetch quiz count
                const quizResult = await axios.get(
                    'http://localhost:7018/api/quiz/getAllQuizzes',
                    {
                        headers: { Authorization: `Bearer ${user.accessToken}` }
                    }
                );
                setQuizCount(quizResult.data.length);

                // Fetch notifications from the notification system
                const notificationsResult = await axios.get(
                    'http://localhost:7018/api/admin/notification-system',
                    {
                        headers: { Authorization: `Bearer ${user.accessToken}` }
                    }
                );
                setNotifications(notificationsResult.data);

                // Count pending items - only count UNREAD status
                const pendingReportsCount = notificationsResult.data.filter(n => 
                    n.relatedType === 'REPORT' && n.status === 'UNREAD'
                ).length;
                const pendingContactsCount = notificationsResult.data.filter(n => 
                    n.relatedType === 'CONTACT' && n.status === 'UNREAD'
                ).length;

                setPendingReports(pendingReportsCount);
                setPendingContacts(pendingContactsCount);

            } catch (error) {
                console.error("Error fetching data:", error);
                if (error.response) {
                    console.error("Error response:", error.response.data);
                    console.error("Error status:", error.response.status);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.accessToken]);

    // Function to refresh notifications
    const refreshNotifications = async () => {
        if (!user?.accessToken) return;
        try {
            const notificationsResult = await axios.get(
                'http://localhost:7018/api/admin/notification-system',
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` }
                }
            );
            setNotifications(notificationsResult.data);

            // Recalculate pending counts
            const pendingReportsCount = notificationsResult.data.filter(n => 
                n.relatedType === 'REPORT' && n.status === 'UNREAD'
            ).length;
            const pendingContactsCount = notificationsResult.data.filter(n => 
                n.relatedType === 'CONTACT' && n.status === 'UNREAD'
            ).length;

            setPendingReports(pendingReportsCount);
            setPendingContacts(pendingContactsCount);
        } catch (error) {
            console.error("Error refreshing notifications:", error);
        }
    };

    const handleNotificationClick = (event) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchor(null);
    };

    const handleNotificationAction = (notification) => {
        handleNotificationClose();
        // Mark notification as read if it's pending
        if (notification.status === 'UNREAD') {
            markNotificationAsRead(notification.id);
        }
        navigate('/admin/notifications');
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            await axios.put(
                `http://localhost:7018/api/admin/notification-system/${notificationId}/read`,
                {},
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` }
                }
            );
            // Refresh notifications after marking as read
            refreshNotifications();
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'REPORT':
                return <AssignmentIcon />;
            case 'CONTACT':
                return <PeopleIcon />;
            default:
                return <NotificationsIcon />;
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

    const quickStats = [
        { 
            title: "Total Quizzes", 
            value: loading ? "..." : quizCount.toString(), 
            icon: <QuizIcon />, 
            color: "#2196f3" 
        },
        { 
            title: "Pending Reports", 
            value: pendingReports.toString(), 
            icon: <AssignmentIcon />, 
            color: "#ff9800" 
        },
        { 
            title: "Contact Messages", 
            value: pendingContacts.toString(), 
            icon: <NotificationsIcon />, 
            color: "#9c27b0" 
        },
    ];

    const dashboardCards = [
        {
            title: "Create a Quiz",
            description: "Create and customize new quizzes with various question types",
            icon: <AddCircleOutlineIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/create-quiz'),
            color: "#2196f3"
        },
        {
            title: "Manage Quizzes",
            description: "View, edit, and manage all your created quizzes",
            icon: <QuizIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/see-all-quiz'),
            color: "#4caf50"
        },
        {
            title: "Quiz Statistics",
            description: "Analyze student performance and quiz statistics",
            icon: <BarChartIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/student-stats'),
            color: "#ff9800"
        }
    ];

    useEffect(() => {
        document.body.classList.add('admin-page');
        return () => document.body.classList.remove('admin-page');
    }, []);

    return (
        <Box className="dashboard-container">
            <AdminNavbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={0} sx={{ p: 3, backgroundColor: 'transparent' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                        <Typography 
                            variant="h3" 
                            component="h1" 
                            sx={{ 
                                fontWeight: 600,
                                color: 'primary.main',
                            }}
                        >
                            Welcome back, {user.username}!
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Tooltip title="Notifications">
                                <IconButton 
                                    color="primary" 
                                    onClick={handleNotificationClick}
                                >
                                    <Badge badgeContent={pendingReports + pendingContacts} color="error">
                                        <NotificationsIcon />
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* Notifications Menu */}
                    <Menu
                        anchorEl={notificationAnchor}
                        open={Boolean(notificationAnchor)}
                        onClose={handleNotificationClose}
                        PaperProps={{
                            sx: { width: 400, maxHeight: 500 }
                        }}
                    >
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="h6">Notifications</Typography>
                        </Box>
                        {notifications.length === 0 ? (
                            <MenuItem>
                                <Typography variant="body2" color="text.secondary">
                                    No new notifications
                                </Typography>
                            </MenuItem>
                        ) : (
                            <List sx={{ p: 0 }}>
                                {notifications.slice(0, 10).map((notification, index) => (
                                    <React.Fragment key={notification.id || index}>
                                        <ListItem 
                                            button 
                                            onClick={() => handleNotificationAction(notification)}
                                            sx={{ 
                                                '&:hover': { 
                                                    backgroundColor: 'action.hover' 
                                                } 
                                            }}
                                        >
                                            <ListItemIcon>
                                                {getNotificationIcon(notification.type)}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={notification.title || `${notification.type} Notification`}
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {notification.message || notification.description}
                                                        </Typography>
                                                        <Box sx={{ mt: 1 }}>
                                                            <Chip 
                                                                label={notification.status} 
                                                                size="small" 
                                                                color={getNotificationColor(notification.type)}
                                                            />
                                                            <Typography variant="caption" sx={{ ml: 1 }}>
                                                                {new Date(notification.createdAt).toLocaleDateString()}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < notifications.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                        {notifications.length > 10 && (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Button 
                                    variant="text" 
                                    onClick={() => {
                                        handleNotificationClose();
                                        navigate('/admin/notifications');
                                    }}
                                >
                                    View All Notifications
                                </Button>
                            </Box>
                        )}
                    </Menu>

                    {/* Quick Stats */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {quickStats.map((stat, index) => (
                            <Grid item xs={12} sm={4} key={index}>
                                <Card className="stats-card" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ 
                                            backgroundColor: `${stat.color}15`,
                                            p: 1,
                                            borderRadius: 2,
                                            color: stat.color
                                        }}>
                                            {stat.icon}
                                        </Box>
                                        <Box>
                                            <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                                                {stat.value}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {stat.title}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Main Action Cards */}
                    <Grid container spacing={3} justifyContent="center">
                        {dashboardCards.map((card, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card 
                                    className="dashboard-card"
                                    sx={{ 
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: 6
                                        }
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                                        <Box 
                                            sx={{ 
                                                display: 'flex',
                                                justifyContent: 'center',
                                                mb: 2,
                                                color: card.color
                                            }}
                                        >
                                            {card.icon}
                                        </Box>
                                        <Typography 
                                            gutterBottom 
                                            variant="h5" 
                                            component="h2"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            {card.title}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{ mb: 2 }}
                                        >
                                            {card.description}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                                        <Button 
                                            variant="contained"
                                            onClick={card.action}
                                            sx={{ 
                                                backgroundColor: card.color,
                                                '&:hover': {
                                                    backgroundColor: card.color,
                                                    opacity: 0.9
                                                }
                                            }}
                                        >
                                            {card.title.split(' ')[0]}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
}

export default Dashboard;