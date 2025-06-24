import {
    ArrowBack as ArrowBackIcon,
    Assignment as AssignmentIcon,
    CheckCircle as CheckCircleIcon,
    Email as EmailIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    IconButton,
    List,
    ListItem,
    Paper,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import './UserReports.css';

function UserReports() {
    const [reports, setReports] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (!user?.accessToken || !user?.id) return;
        
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch user's reports
                const reportsResponse = await axios.get(
                    `http://localhost:7018/api/reports/user/${user.id}`,
                    {
                        headers: { Authorization: `Bearer ${user.accessToken}` }
                    }
                );
                setReports(reportsResponse.data);

                // Fetch user's contacts
                const contactsResponse = await axios.get(
                    `http://localhost:7018/api/contact/user/${user.id}`,
                    {
                        headers: { Authorization: `Bearer ${user.accessToken}` }
                    }
                );
                setContacts(contactsResponse.data);

            } catch (error) {
                console.error("Error fetching data:", error);
                setError('Failed to fetch your reports and contacts');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.accessToken, user?.id]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'warning';
            case 'RESPONDED':
                return 'success';
            case 'RESOLVED':
                return 'info';
            default:
                return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH':
                return 'error';
            case 'MEDIUM':
                return 'warning';
            case 'LOW':
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
            <Box className="user-reports-container">
                <Navbar />
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <CircularProgress />
                    </Box>
                </Container>
            </Box>
        );
    }

    return (
        <Box className="user-reports-container">
            <Navbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={0} sx={{ p: 3, backgroundColor: 'transparent' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                        <IconButton onClick={() => navigate('/dashboard')}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '2.2rem' }}>
                            My Reports & Messages
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={activeTab} onChange={handleTabChange}>
                            <Tab 
                                label={`Reports (${reports.length})`} 
                                icon={<AssignmentIcon />} 
                                iconPosition="start"
                            />
                            <Tab 
                                label={`Messages (${contacts.length})`} 
                                icon={<EmailIcon />} 
                                iconPosition="start"
                            />
                        </Tabs>
                    </Box>

                    {/* Reports Tab */}
                    {activeTab === 0 && (
                        <Box>
                            {reports.length === 0 ? (
                                <Card sx={{ textAlign: 'center', py: 4 }}>
                                    <CardContent>
                                        <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary">
                                            No reports found
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            You haven't submitted any reports yet
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ) : (
                                <List>
                                    {reports.map((report, index) => (
                                        <React.Fragment key={report.id}>
                                            <ListItem 
                                                sx={{ 
                                                    mb: 2,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    borderRadius: 2,
                                                    boxShadow: 1,
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start'
                                                }}
                                            >
                                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Box>
                                                        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                                                            {report.subject}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                            Issue Type: {report.issueType}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Chip 
                                                            label={report.status} 
                                                            size="small" 
                                                            color={getStatusColor(report.status)}
                                                        />
                                                        <Chip 
                                                            label={report.priority} 
                                                            size="small" 
                                                            color={getPriorityColor(report.priority)}
                                                        />
                                                    </Box>
                                                </Box>
                                                
                                                <Typography variant="body1" sx={{ mb: 2, width: '100%' }}>
                                                    {report.description}
                                                </Typography>
                                                
                                                <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                                                    Submitted on: {formatDate(report.createdAt)}
                                                </Typography>

                                                {/* Admin Response */}
                                                {report.adminResponse && (
                                                    <Box sx={{ 
                                                        width: '100%', 
                                                        mt: 2, 
                                                        p: 3, 
                                                        background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                                                        borderRadius: 2,
                                                        border: '2px solid #28a745',
                                                        boxShadow: '0 4px 12px rgba(40, 167, 69, 0.2)'
                                                    }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                            <CheckCircleIcon color="success" fontSize="medium" />
                                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#155724', textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>
                                                                Admin Response
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body1" sx={{ mb: 2, color: '#155724', fontWeight: 500, lineHeight: 1.6, fontSize: '1.1rem' }}>
                                                            {report.adminResponse}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: '#155724', fontWeight: 500 }}>
                                                            Responded by {report.respondedBy} on {formatDate(report.respondedAt)}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {!report.adminResponse && report.status === 'PENDING' && (
                                                    <Box sx={{ 
                                                        width: '100%', 
                                                        mt: 2, 
                                                        p: 3, 
                                                        background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                                                        borderRadius: 2,
                                                        border: '2px solid #f39c12',
                                                        boxShadow: '0 4px 12px rgba(243, 156, 18, 0.2)'
                                                    }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <ScheduleIcon sx={{ color: '#856404', fontSize: '1.5rem' }} />
                                                            <Typography variant="body1" sx={{ color: '#856404', fontWeight: 600, fontSize: '1.1rem', textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>
                                                                Your report is being reviewed by our team
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </ListItem>
                                            {index < reports.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </Box>
                    )}

                    {/* Contacts Tab */}
                    {activeTab === 1 && (
                        <Box>
                            {contacts.length === 0 ? (
                                <Card sx={{ textAlign: 'center', py: 4 }}>
                                    <CardContent>
                                        <EmailIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary">
                                            No messages found
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            You haven't sent any contact messages yet
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ) : (
                                <List>
                                    {contacts.map((contact, index) => (
                                        <React.Fragment key={contact.id}>
                                            <ListItem 
                                                sx={{ 
                                                    mb: 2,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    borderRadius: 2,
                                                    boxShadow: 1,
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start'
                                                }}
                                            >
                                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Box>
                                                        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                                                            {contact.subject}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                            From: {contact.email}
                                                        </Typography>
                                                    </Box>
                                                    <Chip 
                                                        label={contact.status} 
                                                        size="small" 
                                                        color={getStatusColor(contact.status)}
                                                    />
                                                </Box>
                                                
                                                <Typography variant="body1" sx={{ mb: 2, width: '100%' }}>
                                                    {contact.message}
                                                </Typography>
                                                
                                                <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                                                    Sent on: {formatDate(contact.createdAt)}
                                                </Typography>

                                                {/* Admin Response */}
                                                {contact.adminResponse && (
                                                    <Box sx={{ 
                                                        width: '100%', 
                                                        mt: 2, 
                                                        p: 2, 
                                                        backgroundColor: 'success.light', 
                                                        borderRadius: 1,
                                                        border: '1px solid',
                                                        borderColor: 'success.main'
                                                    }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            <CheckCircleIcon color="success" fontSize="small" />
                                                            <Typography variant="subtitle2" color="success.dark" sx={{ fontWeight: 600 }}>
                                                                Admin Response
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            {contact.adminResponse}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Responded by {contact.respondedBy} on {formatDate(contact.respondedAt)}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {!contact.adminResponse && contact.status === 'PENDING' && (
                                                    <Box sx={{ 
                                                        width: '100%', 
                                                        mt: 2, 
                                                        p: 2, 
                                                        backgroundColor: 'warning.light', 
                                                        borderRadius: 1,
                                                        border: '1px solid',
                                                        borderColor: 'warning.main'
                                                    }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <ScheduleIcon color="warning" fontSize="small" />
                                                            <Typography variant="body2" color="warning.dark">
                                                                Your message is being reviewed by our team
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </ListItem>
                                            {index < contacts.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}

export default UserReports; 