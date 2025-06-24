import PersonIcon from '@mui/icons-material/Person';
import ReportIcon from '@mui/icons-material/Report';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Navbar from "../Navbar/Navbar";
import "./Dashboard.css";

function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [user?.accessToken]);

    const fetchData = async () => {
        if (!user?.accessToken) return;
        try {
            setLoading(true);
            setError(null);

            // Fetch all scores
            const scoresResponse = await axios.get(
                "http://localhost:7018/api/quiz/getAllScores",
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                }
            );

            // Fetch all quizzes
            const quizzesResponse = await axios.get(
                "http://localhost:7018/api/quiz/getAllQuizzes",
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                }
            );

            // Process the data
            const quizQuestionCounts = {};
            quizzesResponse.data.forEach(quiz => {
                quizQuestionCounts[quiz.id] = quiz.questions.length;
            });

            setStats({
                scores: scoresResponse.data,
                quizQuestionCounts
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to load statistics. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        if (!stats) return {
            totalQuizzes: 0,
            averageScore: 0,
            lineChartData: [],
            radarData: []
        };

        const { scores, quizQuestionCounts } = stats;
        
        // Group scores by quiz and keep only the best score for each quiz
        const quizBestScores = {};
        scores.forEach(score => {
            const quizId = score.quizId;
            const quizName = score.quizname || 'Unknown Quiz';
            const currentScore = score.score || 0;
            
            if (!quizBestScores[quizId] || currentScore > quizBestScores[quizId].score) {
                quizBestScores[quizId] = {
                    quizId: quizId,
                    name: quizName,
                    score: currentScore,
                    totalQuestions: quizQuestionCounts[quizId] || 0
                };
            }
        });

        // Convert to array and sort by score (descending)
        const uniqueScores = Object.values(quizBestScores).sort((a, b) => b.score - a.score);
        
        const totalQuizzes = uniqueScores.length;
        const totalScore = uniqueScores.reduce((sum, score) => sum + score.score, 0);
        const averageScore = totalQuizzes > 0 ? totalScore / totalQuizzes : 0;

        // Prepare data for charts
        const lineChartData = uniqueScores.map(score => ({
            name: score.name,
            score: score.score,
            totalQuestions: score.totalQuestions
        }));

        const radarData = [
            { subject: 'Average Score', A: averageScore },
            { subject: 'Total Quizzes', A: totalQuizzes },
        ];

        return {
            totalQuizzes,
            averageScore: averageScore.toFixed(1),
            lineChartData,
            radarData
        };
    };

    const handlePhotoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                alert("Please upload an image file");
                return;
            }
            try {
                const reader = new FileReader();
                reader.onloadend = () => {
                    try {
                        setProfilePhoto(reader.result);
                        localStorage.setItem("profilePhoto", reader.result);
                    } catch (error) {
                        console.error("Error setting profile photo:", error);
                        alert("Error saving profile photo. Please try again.");
                    }
                };
                reader.onerror = () => {
                    alert("Error reading file");
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error("Error in photo upload:", error);
                alert("Error uploading photo. Please try again.");
            }
        }
    };

    const handleRemovePhoto = () => {
        setProfilePhoto(null);
        localStorage.removeItem("profilePhoto");
    };

    useEffect(() => {
        const savedPhoto = localStorage.getItem("profilePhoto");
        if (savedPhoto) {
            setProfilePhoto(savedPhoto);
        }
    }, []);

    if (loading) {
        return (
            <Box className="dashboard-container">
                <Navbar />
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <CircularProgress />
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box className="dashboard-container">
                <Navbar />
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Alert severity="error">{error}</Alert>
                </Container>
            </Box>
        );
    }

    const userStats = calculateStats();

    return (
        <Box className="dashboard-container">
            <Navbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    {/* Profile Section */}
                    <Grid item xs={12} md={4}>
                        <Card className="profile-card">
                            <CardContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ position: 'relative' }}>
                                        {profilePhoto ? (
                                            <img 
                                                src={profilePhoto} 
                                                alt="Profile" 
                                                style={{ 
                                                    width: 150, 
                                                    height: 150, 
                                                    borderRadius: '50%',
                                                    objectFit: 'cover'
                                                }} 
                                            />
                                        ) : (
                                            <PersonIcon sx={{ fontSize: 150, color: 'primary.main' }} />
                                        )}
                                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoUpload}
                                                id="photo-upload"
                                                style={{ display: "none" }}
                                            />
                                            <label htmlFor="photo-upload">
                                                <Button
                                                    variant="contained"
                                                    component="span"
                                                >
                                                    Upload Photo
                                                </Button>
                                            </label>
                                            {profilePhoto && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={handleRemovePhoto}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                    <Typography variant="h5" component="h2">
                                        {user.username || "Guest"}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {user.email || "No email provided"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Organization: Power Programmer's Quiz
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Batch: 2022-2026
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ID: {user.id || "N/A"}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => {
                                            localStorage.removeItem("user");
                                            window.location.href = "/login";
                                        }}
                                    >
                                        Logout
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Statistics Section */}
                    <Grid item xs={12} md={8}>
                        <Card className="stats-card">
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                    <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                        Your Statistics
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 3 }} />

                                <Grid container spacing={3}>
                                    {/* Stats Cards */}
                                    <Grid item xs={12} md={6}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Total Quizzes Attempted
                                                </Typography>
                                                <Typography variant="h4">
                                                    {userStats.totalQuizzes}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Average Score
                                                </Typography>
                                                <Typography variant="h4">
                                                    {userStats.averageScore}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Report Issues Card */}
                                    <Grid item xs={12}>
                                        <Card sx={{ 
                                            background: 'linear-gradient(45deg, #ff9800 30%, #f57c00 90%)',
                                            color: 'white'
                                        }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <ReportIcon sx={{ fontSize: 40 }} />
                                                    <Typography variant="h6">
                                                        Report Issues
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ mb: 2 }}>
                                                    Found a problem with a quiz or have a question? Report it to the admin team.
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                                    <Button 
                                                        variant="contained" 
                                                        sx={{ 
                                                            backgroundColor: 'white', 
                                                            color: '#ff9800',
                                                            '&:hover': {
                                                                backgroundColor: '#f5f5f5'
                                                            }
                                                        }}
                                                        onClick={() => navigate('/report-issues')}
                                                    >
                                                        Report Issue
                                                    </Button>
                                                    <Button 
                                                        variant="outlined" 
                                                        sx={{ 
                                                            borderColor: 'white', 
                                                            color: 'white',
                                                            '&:hover': {
                                                                borderColor: 'white',
                                                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                                            }
                                                        }}
                                                        onClick={() => navigate('/user-reports')}
                                                    >
                                                        View My Reports & Messages
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Performance Overview */}
                                    <Grid item xs={12}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Performance Overview
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    {userStats.lineChartData.slice(0, 5).map((row, index) => (
                                                        <Grid item xs={12} key={index}>
                                                            <Paper 
                                                                elevation={2} 
                                                                sx={{ 
                                                                    p: 2,
                                                                    background: 'linear-gradient(45deg, #f5f5f5 30%, #e0e0e0 90%)'
                                                                }}
                                                            >
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <Typography variant="subtitle1">
                                                                        {row.name}
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <Typography variant="h6" color="primary">
                                                                            {row.score}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            / {row.totalQuestions}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                                <Box sx={{ mt: 1 }}>
                                                                    <Box 
                                                                        sx={{ 
                                                                            height: 8, 
                                                                            bgcolor: 'grey.200', 
                                                                            borderRadius: 4,
                                                                            overflow: 'hidden'
                                                                        }}
                                                                    >
                                                                        <Box 
                                                                            sx={{ 
                                                                                height: '100%',
                                                                                width: `${(row.score / row.totalQuestions) * 100}%`,
                                                                                bgcolor: 'primary.main',
                                                                                borderRadius: 4,
                                                                                transition: 'width 0.5s ease-in-out'
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                            </Paper>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Graph Overview */}
                                    {userStats.totalQuizzes > 0 && (
                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="h6" gutterBottom>
                                                        Quiz Results Overview
                                                    </Typography>
                                                    <Box sx={{ height: 300, mt: 2 }}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <LineChart data={userStats.lineChartData}>
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis dataKey="name" />
                                                                <YAxis />
                                                                <Tooltip />
                                                                <Line 
                                                                    type="monotone" 
                                                                    dataKey="score" 
                                                                    stroke="#8884d8"
                                                                    strokeWidth={2}
                                                                    dot={{ r: 4 }}
                                                                    activeDot={{ r: 6 }}
                                                                />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    )}

                                    {/* Recent Scores Table */}
                                    <Grid item xs={12}>
                                        <Box sx={{ mt: 4 }}>
                                            <Typography variant="h6" gutterBottom>
                                                Recent Quiz Results
                                            </Typography>
                                            <TableContainer component={Paper} sx={{ mt: 2 }}>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Quiz Name</TableCell>
                                                            <TableCell align="right">Score</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {userStats.lineChartData.slice(0, 5).map((row, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{row.name}</TableCell>
                                                                <TableCell align="right">
                                                                    {row.score} / {row.totalQuestions}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => navigate('/scores-page')}
                                                >
                                                    View All Results
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default Dashboard;