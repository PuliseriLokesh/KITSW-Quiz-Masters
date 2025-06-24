import {
    Alert,
    Box,
    Button,
    Container,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    TextField,
    Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import './ReportIssues.css';

const ReportIssues = () => {
    const navigate = useNavigate();
    const [reportData, setReportData] = useState({
        issueType: '',
        subject: '',
        description: '',
        priority: 'medium'
    });
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Debug effect to log snackbar state changes
    useEffect(() => {
        console.log('ReportIssues: Snackbar state changed:', snackbar);
    }, [snackbar]);

    const issueTypes = [
        { value: 'quiz_problem', label: 'Quiz Problem' },
        { value: 'technical_issue', label: 'Technical Issue' },
        { value: 'content_error', label: 'Content Error' },
        { value: 'suggestion', label: 'Suggestion' },
        { value: 'other', label: 'Other' }
    ];

    const priorities = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setReportData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('ReportIssues: Form submitted', reportData); // Debug log
        
        if (!reportData.issueType || !reportData.subject || !reportData.description) {
            console.log('ReportIssues: Validation failed - missing fields'); // Debug log
            setSnackbar({
                open: true,
                message: 'Please fill in all required fields',
                severity: 'error'
            });
            return;
        }

        // Check if user is authenticated (optional now)
        const userStr = localStorage.getItem('user');
        let user = null;
        
        try {
            user = userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
        
        console.log('User data:', user); // Debug log
        
        setLoading(true);
        try {
            const userId = user?.id || null;
            const username = user?.username || 'Anonymous User';

            console.log('ReportIssues: Sending request to backend'); // Debug log
            const response = await axios.post('http://localhost:7018/api/reports/submit', {
                ...reportData,
                username: username,
                userId: userId
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('ReportIssues: Backend response:', response); // Debug log
            console.log('ReportIssues: Setting success snackbar'); // Debug log
            
            setSnackbar({
                open: true,
                message: 'Report submitted successfully! We will get back to you soon.',
                severity: 'success'
            });

            // Reset form
            setReportData({
                issueType: '',
                subject: '',
                description: '',
                priority: 'medium'
            });

        } catch (error) {
            console.error('Error submitting report:', error);
            console.log('ReportIssues: Setting error snackbar'); // Debug log
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to submit report. Please try again.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        console.log('ReportIssues: Closing snackbar'); // Debug log
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Box className="report-issues-container">
            {JSON.parse(localStorage.getItem('user'))?.accessToken && <Navbar />}
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
                        Report an Issue
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Issue Type</InputLabel>
                                    <Select
                                        name="issueType"
                                        value={reportData.issueType}
                                        onChange={handleChange}
                                        label="Issue Type"
                                        required
                                    >
                                        {issueTypes.map((type) => (
                                            <MenuItem key={type.value} value={type.value}>
                                                {type.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Subject"
                                    name="subject"
                                    value={reportData.subject}
                                    onChange={handleChange}
                                    placeholder="Brief description of the issue"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Priority</InputLabel>
                                    <Select
                                        name="priority"
                                        value={reportData.priority}
                                        onChange={handleChange}
                                        label="Priority"
                                    >
                                        {priorities.map((priority) => (
                                            <MenuItem key={priority.value} value={priority.value}>
                                                {priority.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Detailed Description"
                                    name="description"
                                    value={reportData.description}
                                    onChange={handleChange}
                                    multiline
                                    rows={6}
                                    placeholder="Please provide detailed information about the issue, including steps to reproduce if applicable..."
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Tips for a better report:</strong>
                                        <br />
                                        • Be specific about the issue you encountered
                                        <br />
                                        • Include any error messages you saw
                                        <br />
                                        • Mention which quiz or page you were on
                                        <br />
                                        • Provide steps to reproduce the issue if possible
                                    </Typography>
                                </Alert>
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            const user = JSON.parse(localStorage.getItem('user'));
                                            if (user?.accessToken) {
                                                navigate('/dashboard');
                                            } else {
                                                navigate('/');
                                            }
                                        }}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        sx={{ minWidth: 120 }}
                                    >
                                        {loading ? 'Submitting...' : 'Submit Report'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Container>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ zIndex: 9999 }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ReportIssues;