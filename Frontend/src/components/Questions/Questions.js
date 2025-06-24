import { Button, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import '../Questions/Questions.css';

function Question() {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visited, setVisited] = useState([]);
  const [attempted, setAttempted] = useState([]);
  const [markedForReview, setMarkedForReview] = useState([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timeLimit, setTimeLimit] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const location = useLocation();
  const navigate = useNavigate();

  const array_of_questions = useMemo(() => location.state?.tem?.questions || [], [location.state?.tem?.questions]);
  const heading = location.state?.tem?.heading || "Unknown Quiz";
  const id_of_quiz = location.state?.tem?.id || 0;
  const currentQuestion = array_of_questions[currentIndex] || {};

  useEffect(() => {
    const totalQuestions = array_of_questions.length;
    setTimeLimit(totalQuestions * 60); // 1 minute per question
  }, [array_of_questions]);

  // Countdown effect for fullscreen prompt
  useEffect(() => {
    let countdownTimer;
    if (showFullscreenPrompt && countdown > 0) {
      countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            // Terminate exam when countdown reaches 0
            handleScoreSubmission();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    };
  }, [showFullscreenPrompt, countdown]);

  // Function to handle fullscreen change
  const handleFullscreenChange = () => {
    try {
      const isCurrentlyFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (!isCurrentlyFullscreen && !isSubmitted) {
        setIsPaused(true);
        setShowFullscreenPrompt(true);
        setCountdown(5); // Reset countdown to 5 seconds
      }
    } catch (error) {
      console.error('Error handling fullscreen change:', error);
    }
  };

  // Function to enter fullscreen
  const enterFullscreen = async () => {
    try {
      const element = document.documentElement;
      
      if (document.fullscreenElement) {
        setIsFullscreen(true);
        setIsPaused(false);
        setShowFullscreenPrompt(false);
        setCountdown(5);
        return;
      }

      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }

      setIsFullscreen(true);
      setIsPaused(false);
      setShowFullscreenPrompt(false);
      setCountdown(5);
    } catch (error) {
      console.error('Error entering fullscreen:', error);
    }
  };

  // Add fullscreen event listeners
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Initial fullscreen request
    enterFullscreen();

    // Cleanup function
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    };
  }, [isSubmitted]);

  // Function to handle return to fullscreen
  const handleReturnToFullscreen = async () => {
    try {
      const element = document.documentElement;
      
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }

      setIsPaused(false);
      setShowFullscreenPrompt(false);
      setCountdown(5);
    } catch (error) {
      console.error('Error returning to fullscreen:', error);
    }
  };

  // Fullscreen prompt component
  const FullscreenPrompt = () => (
    <div className="fullscreen-prompt">
      <div className="fullscreen-prompt-content">
        <h3>⚠ Fullscreen Required</h3>
        <p>The exam will be terminated if you don't return to fullscreen mode.</p>
        <p className="countdown-text">
          {countdown > 0 
            ? `Return to fullscreen in ${countdown} seconds...` 
            : 'Exam terminated!'}
        </p>
        <button onClick={handleReturnToFullscreen}>
          Return to Fullscreen Now
        </button>
      </div>
    </div>
  );

  const calculateTotalScore = useCallback(() => {
    let totalScore = 0;
    const answers = [];
    array_of_questions.forEach((question) => {
      let isCorrect = false;
      let userAnswer = 'Not attempted';

      if (question.questionType === 'MATCHING') {
        // For matching questions, check if all pairs are answered correctly
        const allPairsAnswered = question.leftOptions.every((_, index) => 
          selectedAnswers[`${question.id}-${index}`] !== undefined
        );
        
        if (allPairsAnswered) {
          const correctPairs = question.leftOptions.every((leftOption, index) => {
            const userSelected = selectedAnswers[`${question.id}-${index}`];
            const correctMatch = question.rightOptions[index];
            return userSelected === correctMatch;
          });
          isCorrect = correctPairs;
          userAnswer = question.leftOptions.map((leftOption, index) => 
            `${leftOption} → ${selectedAnswers[`${question.id}-${index}`] || 'Not matched'}`
          ).join(', ');
        }
      } else {
        // For other question types
        isCorrect = selectedAnswers[question.id] === question.answer;
        userAnswer = selectedAnswers[question.id] || 'Not attempted';
      }

      if (isCorrect) {
        totalScore += 1;
      }
      answers.push({
        question: question.question,
        userAnswer,
        correctAnswer: question.questionType === 'MATCHING' 
          ? question.leftOptions.map((left, index) => `${left} → ${question.rightOptions[index]}`).join(', ')
          : question.answer,
        isCorrect
      });
    });
    return { totalScore, answers };
  }, [selectedAnswers, array_of_questions]);

  const handleScoreSubmission = useCallback(() => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    const { totalScore, answers } = calculateTotalScore();
    
    // Calculate attempted questions correctly
    const attemptedQuestions = array_of_questions.filter(question => {
      if (question.questionType === 'MATCHING') {
        // For matching questions, check if all pairs are answered
        return question.leftOptions.every((_, index) => 
          selectedAnswers[`${question.id}-${index}`] !== undefined
        );
      } else {
        // For other question types, check if an answer is selected
        return selectedAnswers[question.id] !== undefined;
      }
    }).length;

    navigate('/score', {
      state: {
        score: totalScore,
        heading_of_quiz: heading,
        id: id_of_quiz,
        totalQuestions: array_of_questions.length,
        attemptedQuestions,
        answers
      },
    });
  }, [navigate, heading, id_of_quiz, array_of_questions, selectedAnswers, calculateTotalScore, isSubmitted]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => {
        if (prev >= timeLimit && !isSubmitted) {
          clearInterval(timer);
          handleScoreSubmission();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, handleScoreSubmission, isSubmitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} Min${mins !== 1 ? 's' : ''}, ${secs} Sec`;
  };

  const handleOptionSelect = (questionId, value) => {
    // Convert questionId to string for checking
    const questionIdStr = String(questionId);
    
    // For matching questions
    if (questionIdStr.includes('-')) {
      const [baseId, index] = questionIdStr.split('-');
      setSelectedAnswers((prev) => ({ ...prev, [questionIdStr]: value }));
      
      const question = array_of_questions.find(q => q.id === parseInt(baseId));
      if (question && question.questionType === 'MATCHING') {
        const allPairsAnswered = question.leftOptions.every((_, idx) => 
          selectedAnswers[`${baseId}-${idx}`] !== undefined || 
          (idx === parseInt(index) && value !== '')
        );
        if (allPairsAnswered && !attempted.includes(parseInt(baseId))) {
          setAttempted([...attempted, parseInt(baseId)]);
        }
      }
    } else {
      // For other question types
      setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }));
      if (!attempted.includes(parseInt(questionId))) {
        setAttempted([...attempted, parseInt(questionId)]);
      }
    }
  };

  const handleClearOption = (questionId) => {
    setSelectedAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });
    setAttempted((prev) => prev.filter((id) => id !== questionId));
  };

  const handleNext = () => {
    // Mark current question as visited before moving to next
    if (!visited.includes(currentQuestion.id)) {
      setVisited([...visited, currentQuestion.id]);
    }

    if (currentIndex < array_of_questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleScoreSubmission();
    }
  };

  const handleMarkForReview = () => {
    if (!markedForReview.includes(currentQuestion.id)) {
      setMarkedForReview([...markedForReview, currentQuestion.id]);
    }
  };

  const handleQuestionVisit = (index) => {
    setCurrentIndex(index);
    const questionId = array_of_questions[index].id;
    if (!visited.includes(questionId)) {
      setVisited([...visited, questionId]);
    }
  };

  const isLastQuestion = currentIndex === array_of_questions.length - 1;
  const buttonText = isLastQuestion ? 'Save and Submit' : 'Next Question';

  if (array_of_questions.length === 0) {
    return (
      <div>
        <Navbar />
        <h2 style={{ textAlign: "center", marginTop: "50px" }}>No questions available for this quiz.</h2>
      </div>
    );
  }

  return (
    <div className={`quiz-page ${isFullscreen ? 'fullscreen' : ''}`}>
      {!isFullscreen && <Navbar />}
      {showFullscreenPrompt && <FullscreenPrompt />}
      <div className="quiz-header">
        <div className="quiz-title">
          <h2>{heading}</h2>
        </div>
        <div className="quiz-timer">
          <span>Time Remaining: {formatTime(timeLimit - timeSpent)}</span>
          {isPaused && <span className="paused-indicator">(PAUSED)</span>}
        </div>
      </div>
      <div className="quiz-content">
        <div className="question-section">
          <h3>Question {currentIndex + 1}:</h3>
          <p>{currentQuestion.question}</p>
          <div className="options">
            {currentQuestion.questionType === 'TRUE_FALSE' ? (
              <div className="true-false-options">
                <label className="option-label">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="true"
                    checked={selectedAnswers[currentQuestion.id] === "true"}
                    onChange={(e) => handleOptionSelect(currentQuestion.id, e.target.value)}
                  />
                  True
                </label>
                <label className="option-label">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="false"
                    checked={selectedAnswers[currentQuestion.id] === "false"}
                    onChange={(e) => handleOptionSelect(currentQuestion.id, e.target.value)}
                  />
                  False
                </label>
              </div>
            ) : currentQuestion.questionType === 'FILL_BLANK' ? (
              <TextField
                fullWidth
                label="Your Answer"
                value={selectedAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleOptionSelect(currentQuestion.id, e.target.value)}
                margin="normal"
              />
            ) : currentQuestion.questionType === 'MATCHING' ? (
              <div className="matching-options">
                {currentQuestion.leftOptions.map((leftOption, index) => (
                  <div key={index} className="matching-pair">
                    <span className="left-option">{leftOption}</span>
                    <Select
                      value={selectedAnswers[`${currentQuestion.id}-${index}`] || ''}
                      onChange={(e) => handleOptionSelect(`${currentQuestion.id}-${index}`, e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>Select matching option</MenuItem>
                      {currentQuestion.rightOptions.map((rightOption, rightIndex) => (
                        <MenuItem key={rightIndex} value={rightOption}>
                          {rightOption}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                ))}
              </div>
            ) : currentQuestion.questionType === 'CODING' ? (
              <div className="coding-question">
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Write your code here"
                  value={selectedAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleOptionSelect(currentQuestion.id, e.target.value)}
                  margin="normal"
                />
                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>
                  Programming Language: {currentQuestion.programmingLanguage}
                </Typography>
              </div>
            ) : (
              // Default MCQ options
              [
                currentQuestion.option1,
                currentQuestion.option2,
                currentQuestion.option3,
                currentQuestion.option4,
              ].filter(Boolean).map((option, index) => (
                <label key={index} className="option-label">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={selectedAnswers[currentQuestion.id] === option}
                    onChange={(e) => handleOptionSelect(currentQuestion.id, e.target.value)}
                  />
                  {option}
                </label>
              ))
            )}
          </div>
          <div className="action-buttons">
            <Button onClick={() => handleClearOption(currentQuestion.id)} color="warning" variant="contained">
              Clear Option
            </Button>
            <Button onClick={handleMarkForReview} sx={{ backgroundColor: '#dc3545', '&:hover': { backgroundColor: '#c82333' } }} variant="contained">
              Mark for Review
            </Button>
          </div>
        </div>
        <div className="question-nav-box">
          <h3>Questions Navigation:</h3>
          <div className="question-nav">
            {array_of_questions.map((q, index) => (
              <button
                key={q.id}
                className={`question-btn ${
                  markedForReview.includes(q.id)
                    ? 'marked-for-review'
                    : attempted.includes(q.id)
                    ? 'attempted'
                    : visited.includes(q.id)
                    ? 'visited'
                    : 'not-visited'
                }`}
                onClick={() => handleQuestionVisit(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 20px' }}>
        <Button onClick={handleNext} className="next-button" disabled={isSubmitted}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

export default Question;