import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    Alert,
    Box,
    Button,
    Container,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../Navbar/AdminNavbar";
import "./CreateQuiz.css";

const CreateQuiz = () => {
    const navigate = useNavigate();
    const [quizData, setQuizData] = useState({
        heading: '',
        timeLimit: 30,
        questions: [],
        isScheduled: false,
        scheduledDate: '',
        scheduledTime: '',
        scheduledEndDate: '',
        scheduledEndTime: ''
    });

    const [currentQuestion, setCurrentQuestion] = useState({
        question: '',
        questionType: 'MCQ',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        answer: '',
        trueFalseAnswer: true,
        fillBlankAnswer: '',
        leftOptions: [],
        rightOptions: [],
        correctMatches: []
    });

    const [newLeftOption, setNewLeftOption] = useState('');
    const [newRightOption, setNewRightOption] = useState('');
    const [newTestCaseInput, setNewTestCaseInput] = useState('');
    const [newTestCaseOutput, setNewTestCaseOutput] = useState('');

    useEffect(() => {
        document.body.classList.add('admin-page');
        return () => document.body.classList.remove('admin-page');
    }, []);

    const handleQuizChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : 
                          name === 'timeLimit' ? parseInt(value) || 0 : value;
        
        setQuizData({
            ...quizData,
            [name]: finalValue
        });
    };

    const handleSchedulingChange = (e) => {
        const { name, value } = e.target;
        setQuizData({
            ...quizData,
            [name]: value
        });
    };

    const validateScheduling = () => {
        if (!quizData.isScheduled) return true;
        
        if (!quizData.scheduledDate || !quizData.scheduledTime) {
            alert('Please set both start date and time for scheduled quiz');
            return false;
        }
        
        if (!quizData.scheduledEndDate || !quizData.scheduledEndTime) {
            alert('Please set both end date and time for scheduled quiz');
            return false;
        }
        
        const startDateTime = new Date(`${quizData.scheduledDate}T${quizData.scheduledTime}`);
        const endDateTime = new Date(`${quizData.scheduledEndDate}T${quizData.scheduledEndTime}`);
        const now = new Date();
        
        if (startDateTime <= now) {
            alert('Start date and time must be in the future');
            return false;
        }
        
        if (endDateTime <= startDateTime) {
            alert('End date and time must be after start date and time');
            return false;
        }
        
        return true;
    };

    const handleQuestionChange = (e) => {
        setCurrentQuestion({
            ...currentQuestion,
            [e.target.name]: e.target.value
        });
    };

    const handleQuestionTypeChange = (e) => {
        setCurrentQuestion({
            ...currentQuestion,
            questionType: e.target.value,
            // Reset type-specific fields
            option1: '',
            option2: '',
            option3: '',
            option4: '',
            answer: '',
            trueFalseAnswer: true,
            fillBlankAnswer: '',
            leftOptions: [],
            rightOptions: [],
            correctMatches: []
        });
    };

    const addMatchingOption = () => {
        if (newLeftOption && newRightOption) {
            setCurrentQuestion({
                ...currentQuestion,
                leftOptions: [...currentQuestion.leftOptions, newLeftOption],
                rightOptions: [...currentQuestion.rightOptions, newRightOption],
                correctMatches: [...currentQuestion.correctMatches, `${newLeftOption}:${newRightOption}`]
            });
            setNewLeftOption('');
            setNewRightOption('');
        }
    };

    const removeMatchingOption = (index) => {
        const newLeftOptions = [...currentQuestion.leftOptions];
        const newRightOptions = [...currentQuestion.rightOptions];
        const newCorrectMatches = [...currentQuestion.correctMatches];
        
        newLeftOptions.splice(index, 1);
        newRightOptions.splice(index, 1);
        newCorrectMatches.splice(index, 1);
        
        setCurrentQuestion({
            ...currentQuestion,
            leftOptions: newLeftOptions,
            rightOptions: newRightOptions,
            correctMatches: newCorrectMatches
        });
    };

    const addQuestion = () => {
        if (!currentQuestion.question) {
            alert('Please enter a question');
            return;
        }

        // Validate based on question type
        switch (currentQuestion.questionType) {
            case 'MCQ':
                if (!currentQuestion.option1 || !currentQuestion.option2 || !currentQuestion.option3 || !currentQuestion.option4 || !currentQuestion.answer) {
                    alert('Please fill all MCQ options and select an answer');
                    return;
                }
                break;
            case 'TRUE_FALSE':
                if (currentQuestion.trueFalseAnswer === undefined) {
                    alert('Please select True or False');
                    return;
                }
                break;
            case 'FILL_BLANK':
                if (!currentQuestion.fillBlankAnswer) {
                    alert('Please provide the correct answer');
                    return;
                }
                break;
            case 'MATCHING':
                if (currentQuestion.leftOptions.length === 0 || currentQuestion.rightOptions.length === 0) {
                    alert('Please add at least one matching pair');
                    return;
                }
                break;
            default:
                break;
        }

        setQuizData({
            ...quizData,
            questions: [...quizData.questions, { ...currentQuestion }]
        });

        // Reset current question
        setCurrentQuestion({
            question: '',
            questionType: 'MCQ',
            option1: '',
            option2: '',
            option3: '',
            option4: '',
            answer: '',
            trueFalseAnswer: true,
            fillBlankAnswer: '',
            leftOptions: [],
            rightOptions: [],
            correctMatches: []
        });
    };

    const removeQuestion = (index) => {
        const newQuestions = [...quizData.questions];
        newQuestions.splice(index, 1);
        setQuizData({
            ...quizData,
            questions: newQuestions
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!quizData.heading) {
            alert('Please enter a quiz title');
            return;
        }
        if (quizData.questions.length === 0) {
            alert('Please add at least one question');
            return;
        }
        if (quizData.timeLimit <= 0) {
            alert('Time limit must be greater than 0');
            return;
        }

        // Validate scheduling if enabled
        if (!validateScheduling()) {
            return;
        }

        try {
            // Get the JWT token from localStorage
            const user = JSON.parse(localStorage.getItem('user'));
            console.log('Full user data from localStorage:', user);

            if (!user?.accessToken) {
                alert('Please login to create a quiz');
                navigate('/login');
                return;
            }

            // Check if user has ADMIN role
            if (!user.roles?.includes('ROLE_ADMIN')) {
                alert('You do not have permission to create quizzes. Only administrators can create quizzes.');
                return;
            }

            // Prepare quiz data with scheduling information
            const quizPayload = {
                ...quizData,
                timeLimit: Number(quizData.timeLimit),
                isScheduled: quizData.isScheduled,
                scheduledStartDateTime: quizData.isScheduled ? 
                    `${quizData.scheduledDate}T${quizData.scheduledTime}` : null,
                scheduledEndDateTime: quizData.isScheduled ? 
                    `${quizData.scheduledEndDate}T${quizData.scheduledEndTime}` : null
            };

            console.log('Sending quiz data:', quizPayload);
            const response = await axios.post('http://localhost:7018/api/quiz/createQuiz', quizPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}`
                }
            });
            console.log('Response:', response.data);
            
            const message = quizData.isScheduled ? 
                'Scheduled quiz created successfully!' : 
                'Quiz created successfully!';
            alert(message);
            navigate("/Admin-page");
        } catch (error) {
            console.error('Full error object:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                if (error.response.status === 401) {
                    alert('Session expired. Please login again.');
                    navigate('/login');
                } else if (error.response.status === 403) {
                    alert('Access denied. You do not have permission to create quizzes.');
                } else {
                    alert('Error creating quiz: ' + (error.response.data?.message || error.response.data || 'Server error'));
                }
            } else if (error.request) {
                console.error('Error request:', error.request);
                alert('Error creating quiz: No response from server. Please check if the server is running.');
            } else {
                console.error('Error message:', error.message);
                alert('Error creating quiz: ' + error.message);
            }
        }
    };

    const renderQuestionTypeFields = () => {
        switch (currentQuestion.questionType) {
            case 'MCQ':
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Option 1"
                                name="option1"
                                value={currentQuestion.option1}
                                onChange={handleQuestionChange}
                                sx={{ mb: 2 }}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Option 2"
                                name="option2"
                                value={currentQuestion.option2}
                                onChange={handleQuestionChange}
                                sx={{ mb: 2 }}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Option 3"
                                name="option3"
                                value={currentQuestion.option3}
                                onChange={handleQuestionChange}
                                sx={{ mb: 2 }}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Option 4"
                                name="option4"
                                value={currentQuestion.option4}
                                onChange={handleQuestionChange}
                                sx={{ mb: 2 }}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel id="answer-label">Correct Answer</InputLabel>
                                <Select
                                    labelId="answer-label"
                                    name="answer"
                                    value={currentQuestion.answer}
                                    onChange={handleQuestionChange}
                                    label="Correct Answer"
                                >
                                    <MenuItem value={currentQuestion.option1}>Option 1</MenuItem>
                                    <MenuItem value={currentQuestion.option2}>Option 2</MenuItem>
                                    <MenuItem value={currentQuestion.option3}>Option 3</MenuItem>
                                    <MenuItem value={currentQuestion.option4}>Option 4</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                );

            case 'TRUE_FALSE':
                return (
                    <FormControl fullWidth>
                        <InputLabel id="true-false-label">Correct Answer</InputLabel>
                        <Select
                            labelId="true-false-label"
                            name="trueFalseAnswer"
                            value={currentQuestion.trueFalseAnswer}
                            onChange={handleQuestionChange}
                            label="Correct Answer"
                        >
                            <MenuItem value={true}>True</MenuItem>
                            <MenuItem value={false}>False</MenuItem>
                        </Select>
                    </FormControl>
                );

            case 'FILL_BLANK':
                return (
                    <TextField
                        fullWidth
                        label="Correct Answer"
                        name="fillBlankAnswer"
                        value={currentQuestion.fillBlankAnswer}
                        onChange={handleQuestionChange}
                        InputLabelProps={{ shrink: true }}
                    />
                );

            case 'MATCHING':
                return (
                    <Box>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={5}>
                                <TextField
                                    fullWidth
                                    label="Left Option"
                                    value={newLeftOption}
                                    onChange={(e) => setNewLeftOption(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField
                                    fullWidth
                                    label="Right Option"
                                    value={newRightOption}
                                    onChange={(e) => setNewRightOption(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={addMatchingOption}
                                    startIcon={<AddIcon />}
                                    sx={{ height: '56px' }}
                                >
                                    Add
                                </Button>
                            </Grid>
                        </Grid>
                        {currentQuestion.leftOptions.map((left, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography sx={{ flex: 1 }}>{left}</Typography>
                                <Typography sx={{ mx: 2 }}>→</Typography>
                                <Typography sx={{ flex: 1 }}>{currentQuestion.rightOptions[index]}</Typography>
                                <IconButton onClick={() => removeMatchingOption(index)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <div className="create-quiz-page">
            <AdminNavbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Create New Quiz
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Quiz Title"
                                name="heading"
                                value={quizData.heading}
                                onChange={handleQuizChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Time Limit (minutes)"
                                name="timeLimit"
                                type="number"
                                value={quizData.timeLimit}
                                onChange={handleQuizChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Quiz Scheduling
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={quizData.isScheduled}
                                        onChange={handleQuizChange}
                                        name="isScheduled"
                                    />
                                }
                                label="Schedule this quiz for later"
                            />
                        </Grid>
                        
                        {quizData.isScheduled && (
                            <>
                                <Grid item xs={12}>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        Scheduled quizzes will only be available to students during the specified time period.
                                    </Alert>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Start Date & Time
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Start Date"
                                                name="scheduledDate"
                                                type="date"
                                                value={quizData.scheduledDate}
                                                onChange={handleSchedulingChange}
                                                InputLabelProps={{ shrink: true }}
                                                inputProps={{
                                                    min: new Date().toISOString().split('T')[0]
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Start Time"
                                                name="scheduledTime"
                                                type="time"
                                                value={quizData.scheduledTime}
                                                onChange={handleSchedulingChange}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        End Date & Time
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="End Date"
                                                name="scheduledEndDate"
                                                type="date"
                                                value={quizData.scheduledEndDate}
                                                onChange={handleSchedulingChange}
                                                InputLabelProps={{ shrink: true }}
                                                inputProps={{
                                                    min: quizData.scheduledDate || new Date().toISOString().split('T')[0]
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="End Time"
                                                name="scheduledEndTime"
                                                type="time"
                                                value={quizData.scheduledEndTime}
                                                onChange={handleSchedulingChange}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Paper>

                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Add Questions
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Question"
                                name="question"
                                value={currentQuestion.question}
                                onChange={handleQuestionChange}
                                multiline
                                rows={2}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel id="question-type-label">Question Type</InputLabel>
                                <Select
                                    labelId="question-type-label"
                                    name="questionType"
                                    value={currentQuestion.questionType}
                                    onChange={handleQuestionTypeChange}
                                    label="Question Type"
                                >
                                    <MenuItem value="MCQ">Multiple Choice</MenuItem>
                                    <MenuItem value="TRUE_FALSE">True/False</MenuItem>
                                    <MenuItem value="FILL_BLANK">Fill in the Blank</MenuItem>
                                    <MenuItem value="MATCHING">Matching</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            {renderQuestionTypeFields()}
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={addQuestion}
                                startIcon={<AddIcon />}
                                sx={{ mt: 2 }}
                            >
                                Add Question
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {quizData.questions.length > 0 && (
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h5" component="h2" gutterBottom>
                            Added Questions ({quizData.questions.length})
                        </Typography>
                        <List>
                            {quizData.questions.map((q, index) => (
                                <ListItem
                                    key={index}
                                    divider
                                    secondaryAction={
                                        <IconButton edge="end" onClick={() => removeQuestion(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={`${index + 1}. ${q.question}`}
                                        secondary={`Type: ${q.questionType}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                disabled={!quizData.heading || quizData.questions.length === 0}
                            >
                                Create Quiz
                            </Button>
                        </Box>
                    </Paper>
                )}
            </Container>
        </div>
    );
};

export default CreateQuiz;