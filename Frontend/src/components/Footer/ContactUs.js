import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    Snackbar,
    TextField,
    Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import './ContactUs.css';

const ContactUs = () => {
    const navigate = useNavigate();
    const [contactData, setContactData] = useState({
        username: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Debug effect to log snackbar state changes
    useEffect(() => {
        console.log('ContactUs: Snackbar state changed:', snackbar);
    }, [snackbar]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContactData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('ContactUs: Form submitted', contactData); // Debug log
        
        if (!contactData.username || !contactData.email || !contactData.subject || !contactData.message) {
            console.log('ContactUs: Validation failed - missing fields'); // Debug log
            setSnackbar({
                open: true,
                message: 'Please fill in all required fields',
                severity: 'error'
            });
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactData.email)) {
            console.log('ContactUs: Validation failed - invalid email'); // Debug log
            setSnackbar({
                open: true,
                message: 'Please enter a valid email address',
                severity: 'error'
            });
            return;
        }

        // Check if user is authenticated (optional now)
        const user = JSON.parse(localStorage.getItem('user'));
        
        setLoading(true);
        try {
            const userId = user?.id || null;

            console.log('ContactUs: Sending request to backend'); // Debug log
            const response = await axios.post('http://localhost:7018/api/contact/submit', {
                ...contactData,
                userId: userId
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('ContactUs: Backend response:', response); // Debug log
            console.log('ContactUs: Setting success snackbar'); // Debug log
            
            setSnackbar({
                open: true,
                message: 'Message sent successfully! We will get back to you soon.',
                severity: 'success'
            });

            // Reset form
            setContactData({
                username: '',
                email: '',
                subject: '',
                message: ''
            });

        } catch (error) {
            console.error('Error sending message:', error);
            console.log('ContactUs: Setting error snackbar'); // Debug log
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to send message. Please try again.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        console.log('ContactUs: Closing snackbar'); // Debug log
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Box className="contact-us-container">
            <Navbar />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
                        Contact Us
                    </Typography>
                    
                    <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary' }}>
                        Have a question or need help? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                fullWidth
                                label="Your Name"
                                name="username"
                                value={contactData.username}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                            />

                            <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                type="email"
                                value={contactData.email}
                                onChange={handleChange}
                                
                                placeholder="Enter your email address"
                            />

                            <TextField
                                fullWidth
                                label="Subject"
                                name="subject"
                                value={contactData.subject}
                                onChange={handleChange}
                                
                                placeholder="What is this about?"
                            />

                            <TextField
                                fullWidth
                                label="Message"
                                name="message"
                                value={contactData.message}
                                onChange={handleChange}
                                multiline
                                rows={6}
                                
                                placeholder="Tell us more about your inquiry..."
                            />

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/')}
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
                                    {loading ? 'Sending...' : 'Send Message'}
                                </Button>
                            </Box>
                        </Box>
                    </form>

                    <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Other Ways to Reach Us
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • Email: support@quizapp.com
                            <br />
                            • Phone: +1 (555) 123-4567
                            <br />
                            • Office Hours: Monday - Friday, 9:00 AM - 6:00 PM EST
                        </Typography>
                    </Box>
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

export default ContactUs;