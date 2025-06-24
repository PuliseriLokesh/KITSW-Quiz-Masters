import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from '@mui/icons-material/Save';
import {
    Box,
    Button,
    Container,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from '@mui/material';
import axios from "axios";
import React, { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import AdminNavbar from "../Navbar/AdminNavbar";

function UpdateQuestion() {
  const location = useLocation();
  const question_details = location.state.question;
  const quiz_id = location.state.quiz_id;
  const gg = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [questionData, setQuestionData] = useState({
    id: question_details.id,
    question: question_details.question,
    questionType: question_details.questionType || 'MCQ',
    option1: question_details.option1 || '',
    option2: question_details.option2 || '',
    option3: question_details.option3 || '',
    option4: question_details.option4 || '',
    answer: question_details.answer || '',
    trueFalseAnswer: question_details.trueFalseAnswer ?? true,
    fillBlankAnswer: question_details.fillBlankAnswer || '',
    leftOptions: question_details.leftOptions || [],
    rightOptions: question_details.rightOptions || [],
    correctMatches: question_details.correctMatches || []
  });

  const [newLeftOption, setNewLeftOption] = useState("");
  const [newRightOption, setNewRightOption] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionTypeChange = (e) => {
    const questionType = e.target.value;
    setQuestionData(prev => ({
      ...prev,
      questionType,
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
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.put(
        `http://localhost:7018/api/quiz/updateQuestion/${questionData.id}`,
        questionData,
        {
          headers: {
            Authorization: `Bearer ${gg?.accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        alert('Question updated successfully!');
        navigate("/modify-quiz", { state: { quiz_id: quiz_id } });
      }
    } catch (error) {
      console.error("Error updating question:", error);
      alert("Failed to update question. Please try again.");
    }
  };

  const addMatchingOption = () => {
    if (newLeftOption && newRightOption) {
      setQuestionData(prev => ({
        ...prev,
        leftOptions: [...prev.leftOptions, newLeftOption],
        rightOptions: [...prev.rightOptions, newRightOption],
        correctMatches: [...prev.correctMatches, `${newLeftOption}:${newRightOption}`]
      }));
      setNewLeftOption("");
      setNewRightOption("");
    }
  };

  const removeMatchingOption = (index) => {
    const newLeftOptions = [...questionData.leftOptions];
    const newRightOptions = [...questionData.rightOptions];
    const newCorrectMatches = [...questionData.correctMatches];
    
    newLeftOptions.splice(index, 1);
    newRightOptions.splice(index, 1);
    newCorrectMatches.splice(index, 1);
    
    setQuestionData({
      ...questionData,
      leftOptions: newLeftOptions,
      rightOptions: newRightOptions,
      correctMatches: newCorrectMatches
    });
  };

  const renderQuestionTypeFields = () => {
    switch (questionData.questionType) {
      case 'MCQ':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Option 1"
                name="option1"
                value={questionData.option1}
                onChange={handleChange}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Option 2"
                name="option2"
                value={questionData.option2}
                onChange={handleChange}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Option 3"
                name="option3"
                value={questionData.option3}
                onChange={handleChange}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Option 4"
                name="option4"
                value={questionData.option4}
                onChange={handleChange}
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
                  value={questionData.answer}
                  onChange={handleChange}
                  label="Correct Answer"
                >
                  <MenuItem value={questionData.option1}>Option 1</MenuItem>
                  <MenuItem value={questionData.option2}>Option 2</MenuItem>
                  <MenuItem value={questionData.option3}>Option 3</MenuItem>
                  <MenuItem value={questionData.option4}>Option 4</MenuItem>
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
              value={questionData.trueFalseAnswer}
              onChange={handleChange}
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
            value={questionData.fillBlankAnswer}
            onChange={handleChange}
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
                  sx={{ height: "56px" }}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
            {questionData.leftOptions.map((left, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography sx={{ flex: 1 }}>{left}</Typography>
                <Typography sx={{ mx: 2 }}>→</Typography>
                <Typography sx={{ flex: 1 }}>{questionData.rightOptions[index]}</Typography>
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
    <div className="update-question-page">
      <AdminNavbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton
              onClick={() => navigate("/modify-quiz", { state: { quiz_id: quiz_id } })}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              Update Question
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Question"
                name="question"
                value={questionData.question}
                onChange={handleChange}
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
                  value={questionData.questionType}
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
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/modify-quiz", { state: { quiz_id: quiz_id } })}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={!questionData.question}
                >
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </div>
  );
}

export default UpdateQuestion;
