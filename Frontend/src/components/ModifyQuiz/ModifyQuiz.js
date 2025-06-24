import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    Chip,
    Container,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography
} from '@mui/material';
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import AdminNavbar from "../Navbar/AdminNavbar";
import "./ModifyQuiz.css";

function ModifyQuiz() {
  const location = useLocation();
  const heading_of_quiz = location.state?.heading_of_quiz || "Unknown Quiz";
  const id_of_quiz = location.state?.quiz_id;

  const navigate = useNavigate();
  const gg = JSON.parse(localStorage.getItem("user"));
  const [Data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id_of_quiz) {
        setError("Quiz ID is missing!");
        setLoading(false);
        return;
      }

      try {
        const result = await axios.get(
          `http://localhost:7018/api/quiz/GetAllQuestions/${id_of_quiz}`,
          {
            headers: { Authorization: `Bearer ${gg?.accessToken || ""}` },
          }
        );

        if (Array.isArray(result.data)) {
          setData(result.data);
        } else if (result.data.questions) {
          setData(result.data.questions);
        } else {
          setData([]);
        }
      } catch (error) {
        setError("Failed to load questions. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_of_quiz, gg?.accessToken]);

  useEffect(() => {
    document.body.classList.add('admin-page');
    return () => document.body.classList.remove('admin-page');
  }, []);

  const handleDelete = async (questionId) => {
    try {
      const response = await axios.delete(
        `http://localhost:7018/api/quiz/removeQuestion/${id_of_quiz}/${questionId}`,
        {
          headers: { Authorization: `Bearer ${gg?.accessToken || ""}` },
        }
      );

      if (response.status === 200) {
        setData((prev) => prev.filter((q) => q.id !== questionId));
        alert("Question deleted successfully.");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete the question.");
    }
  };

  const handleUpdate = (question) => {
    navigate("/updating-a-question", { state: { question, quiz_id: id_of_quiz } });
  };

  const handleAddQuestion = () => {
    navigate("/add-a-question", { state: { quiz_id: id_of_quiz, heading_of_quiz } });
  };

  const renderQuestionContent = (question) => {
    switch (question.questionType) {
      case 'TRUE_FALSE':
        return (
          <Box sx={{ mt: 1 }}>
            <Chip label="True/False" color="primary" size="small" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Correct Answer: {question.trueFalseAnswer ? 'True' : 'False'}
            </Typography>
          </Box>
        );
      case 'FILL_BLANK':
        return (
          <Box sx={{ mt: 1 }}>
            <Chip label="Fill in the Blank" color="primary" size="small" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Correct Answer: {question.fillBlankAnswer}
            </Typography>
          </Box>
        );
      case 'MATCHING':
        return (
          <Box sx={{ mt: 1 }}>
            <Chip label="Matching" color="primary" size="small" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {question.leftOptions.length} pairs to match
            </Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ mt: 1 }}>
            <Chip label="Multiple Choice" color="primary" size="small" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Options: {[question.option1, question.option2, question.option3, question.option4].filter(Boolean).join(', ')}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <div className="modify-quiz-page">
      <AdminNavbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
              {heading_of_quiz}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddQuestion}
            >
              Add New Question
            </Button>
          </Box>
        </Paper>

        {loading ? (
          <Typography variant="h6" align="center" sx={{ mt: 4 }}>
            Loading questions...
          </Typography>
        ) : error ? (
          <Typography variant="h6" color="error" align="center" sx={{ mt: 4 }}>
            {error}
          </Typography>
        ) : Data.length > 0 ? (
          <Paper elevation={3} sx={{ p: 3 }}>
            <List>
              {Data.map((question, index) => (
                <React.Fragment key={question.id}>
                  <ListItem
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      py: 2
                    }}
                  >
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <ListItemText
                        primary={
                          <Typography variant="h6">
                            {index + 1}. {question.question}
                          </Typography>
                        }
                        secondary={renderQuestionContent(question)}
                      />
                      <Box>
                        <IconButton
                          color="primary"
                          onClick={() => handleUpdate(question)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(question.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                  {index < Data.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        ) : (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No questions present in this quiz yet.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddQuestion}
              sx={{ mt: 2 }}
            >
              Add First Question
            </Button>
          </Paper>
        )}
      </Container>
    </div>
  );
}

export default ModifyQuiz;
