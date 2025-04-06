import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const theme = createTheme();

export default function Register() {
    const [UserName, setUserName] = useState('');
    const [Email, setEmail] = useState('');
    const [Password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const history = useNavigate();
    
    const validateForm = () => {
        // Reset error message
        setErrorMessage('');

        // Check if all fields are filled
        if (!UserName || !Email || !Password) {
            setErrorMessage("Please fill in all fields before submitting.");
            return false;
        }

        // Validate username
        if (UserName.length < 3) {
            setErrorMessage("Username must be at least 3 characters long.");
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(Email)) {
            setErrorMessage("Please enter a valid email address.");
            return false;
        }

        // Validate password strength
        if (Password.length < 8) {
            setErrorMessage("Password must be at least 8 characters long.");
            return false;
        }

        // Check for password complexity
        const hasUpperCase = /[A-Z]/.test(Password);
        const hasLowerCase = /[a-z]/.test(Password);
        const hasNumbers = /\d/.test(Password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(Password);

        if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
            setErrorMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
            return false;
        }

        return true;
    };
    
    const handleSignUp = async (event) => {
        event.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await axios.post('http://localhost:7018/api/auth/signup', {
                username: UserName,
                email: Email,
                password: Password,
                role: ["user"]
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 200) {
                alert(`Registration successful!\n\nWelcome ${UserName}! Your account has been created.\n\nYou can now login with your email and password.`);
                history("/");
            }
        } catch (error) {
            console.error("Registration error:", error);
            
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        setErrorMessage("This username or email is already registered. Please try logging in instead or use a different username/email.");
                        break;
                    case 409:
                        setErrorMessage("Invalid registration data. Please check your information and try again.");
                        break;
                    case 500:
                        setErrorMessage("Server error. Please try again later.");
                        break;
                    default:
                        setErrorMessage("Registration failed. Please try again.");
                }
            } else if (error.request) {
                setErrorMessage("Unable to connect to the server. Please check your internet connection and try again.");
            } else {
                setErrorMessage("An unexpected error occurred. Please try again later.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        alignItems: 'center',
                        width: 300,
                        mx: 'auto',
                        my: 4,
                        py: 3,
                        px: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        borderRadius: 'sm',
                        boxShadow: 'md',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign up
                    </Typography>
                    {errorMessage && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {errorMessage}
                        </Typography>
                    )}
                    <Box component="form" noValidate sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="username"
                                    label="User Name"
                                    name="username"
                                    autoComplete="username"
                                    value={UserName} 
                                    onChange={(e) => setUserName(e.target.value)}
                                    error={!!errorMessage && UserName.length < 3}
                                    helperText={!!errorMessage && UserName.length < 3 ? "Username must be at least 3 characters long" : ""}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    value={Email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    error={!!errorMessage && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)}
                                    helperText={!!errorMessage && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email) ? "Please enter a valid email address" : ""}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    value={Password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    error={!!errorMessage && Password.length < 8}
                                    helperText={!!errorMessage && Password.length < 8 ? "Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters" : ""}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            onClick={handleSignUp}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing Up...' : 'Sign Up'}
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/" variant="body2">
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}