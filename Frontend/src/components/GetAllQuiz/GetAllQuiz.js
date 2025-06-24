import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import QuizIcon from '@mui/icons-material/Quiz';
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material';
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../Navbar/AdminNavbar";
import "./GetAllQuiz.css";

function GetAllQuiz() {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
        document.body.classList.add('admin-page');
        return () => document.body.classList.remove('admin-page');
    }, [user?.accessToken]);

    const fetchQuizzes = async () => {
        if (!user?.accessToken) return;
        try {
            setLoading(true);
            setError(null);
            const result = await axios.get(
                "http://localhost:7018/api/quiz/getAllQuizzes",
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                }
            );
            setQuizzes(result.data);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            setError("Failed to load quizzes. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (quiz) => {
        setQuizToDelete(quiz);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(
                `http://localhost:7018/api/quiz/deleteQuiz/${quizToDelete.id}`,
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            await axios.delete(
                `http://localhost:7018/api/quiz/deleteScoresByQuizName/${quizToDelete.heading}`,
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            setQuizzes(quizzes.filter(q => q.id !== quizToDelete.id));
            setDeleteDialogOpen(false);
            setQuizToDelete(null);
        } catch (error) {
            console.error("Error deleting quiz:", error);
            setError("Failed to delete quiz. Please try again.");
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setQuizToDelete(null);
    };

    return (
        <Box className="get-all-quiz-container">
            <AdminNavbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Your Quizzes
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/create-quiz')}
                        sx={{
                            backgroundColor: '#4caf50',
                            '&:hover': {
                                backgroundColor: '#388e3c',
                            },
                        }}
                    >
                        Create New Quiz
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : quizzes.length === 0 ? (
                    <Card sx={{ p: 4, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                        <QuizIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No quizzes created yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Start by creating your first quiz!
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/create-quiz')}
                            sx={{
                                backgroundColor: '#4caf50',
                                '&:hover': {
                                    backgroundColor: '#388e3c',
                                },
                            }}
                        >
                            Create Quiz
                        </Button>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {quizzes.map((quiz) => (
                            <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                                <Card 
                                    className="quiz-card"
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
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <QuizIcon sx={{ color: 'primary.main', mr: 1 }} />
                                            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                                                {quiz.heading}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <AccessTimeIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Time Limit: {quiz.timeLimit} minutes
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Chip 
                                                label={`${quiz.questions?.length || 0} Questions`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                            {quiz.is_scheduled && (
                                                <Chip 
                                                    label="Scheduled"
                                                    size="small"
                                                    color="warning"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Box>
                                    </CardContent>
                                    <CardActions sx={{ p: 2, pt: 0 }}>
                                        <Tooltip title="Modify Quiz">
                                            <Button
                                                variant="outlined"
                                                startIcon={<EditIcon />}
                                                onClick={() => navigate("/modify-quiz", {
                                                    state: { quiz_id: quiz.id, heading_of_quiz: quiz.heading }
                                                })}
                                                sx={{ mr: 1 }}
                                            >
                                                Modify
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Add Question">
                                            <Button
                                                variant="outlined"
                                                startIcon={<AddIcon />}
                                                onClick={() => navigate("/add-a-question", {
                                                    state: { quiz_id: quiz.id, heading_of_quiz: quiz.heading }
                                                })}
                                                sx={{ mr: 1 }}
                                            >
                                                Add Question
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Delete Quiz">
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteClick(quiz)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                <Dialog
                    open={deleteDialogOpen}
                    onClose={handleDeleteCancel}
                    aria-labelledby="delete-dialog-title"
                >
                    <DialogTitle id="delete-dialog-title">
                        Delete Quiz
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete the quiz "{quizToDelete?.heading}"? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteCancel} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}

export default GetAllQuiz;