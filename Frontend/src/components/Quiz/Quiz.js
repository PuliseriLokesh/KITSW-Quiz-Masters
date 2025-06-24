import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import "./Quiz.css";

function Quiz() {
    const [data, setData] = useState([]);
    const [completedQuizzes, setCompletedQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showGuidelines, setShowGuidelines] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                navigate('/login');
                return;
            }

            const user = JSON.parse(userStr);
            if (!user.accessToken) {
                navigate('/login');
                return;
            }
            
            const result = await axios.get(`http://localhost:7018/api/quiz/getAllQuizzesForDisplay`, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });
            setData(result.data);
            
            const scoresResult = await axios.get(`http://localhost:7018/api/quiz/getAllScores`, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });
            
            const completedQuizIds = scoresResult.data
                .filter(score => score.username === user.username)
                .map(score => score.quizId);
            
            setCompletedQuizzes(completedQuizIds);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                setError("Failed to load quizzes. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Add effect to refresh data when component becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const handleAttemptQuiz = (item) => {
        setSelectedQuiz(item);
        setShowGuidelines(true);
    };

    const handleStartQuiz = () => {
        setShowGuidelines(false);
        navigate("/questions", { state: { tem: selectedQuiz } });
    };

    const handleViewLeaderboard = (quizId, quizName) => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }

        const user = JSON.parse(userStr);
        if (!user.accessToken) {
            navigate('/login');
            return;
        }

        // Store the quiz data in localStorage to ensure it persists
        localStorage.setItem('currentQuiz', JSON.stringify({
            quizId: quizId,
            quizName: quizName
        }));

        // Use replace instead of navigate to prevent back button issues
        navigate('/leaderboard', { replace: true });
    };

    // Helper function to check if quiz is currently available
    const isQuizAvailable = (quiz) => {
        if (!quiz.is_scheduled) {
            return true; // Non-scheduled quizzes are always available
        }
        
        if (!quiz.scheduledStartDateTime || !quiz.scheduledEndDateTime) {
            return false; // If scheduling data is missing, treat as unavailable
        }
        
        const now = new Date();
        const startTime = new Date(quiz.scheduledStartDateTime);
        const endTime = new Date(quiz.scheduledEndDateTime);
        
        // Check if dates are valid
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            return false;
        }
        
        return now >= startTime && now <= endTime;
    };

    // Helper function to check if quiz is upcoming
    const isQuizUpcoming = (quiz) => {
        if (!quiz.is_scheduled) {
            return false; // Non-scheduled quizzes are not "upcoming"
        }
        
        if (!quiz.scheduledStartDateTime) {
            return false; // If start time is missing, not upcoming
        }
        
        const now = new Date();
        const startTime = new Date(quiz.scheduledStartDateTime);
        
        // Check if date is valid
        if (isNaN(startTime.getTime())) {
            return false;
        }
        
        return now < startTime;
    };

    // Helper function to format date safely
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        // Handle array format (LocalDateTime serialized as array)
        if (Array.isArray(dateString)) {
            try {
                // Convert array format [year, month, day, hour, minute, second] to Date
                const [year, month, day, hour, minute, second] = dateString;
                return new Date(year, month - 1, day, hour, minute, second || 0).toLocaleString();
            } catch (error) {
                console.error('Error parsing date array:', dateString, error);
                return 'Invalid Date';
            }
        }
        
        // Handle string format
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.error('Invalid date string:', dateString);
                return 'Invalid Date';
            }
            return date.toLocaleString();
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    if (loading) {
        return (
            <div className="dashboard">
                <Navbar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <h2>Loading quizzes...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <Navbar />
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button className="retry-button" onClick={() => window.location.reload()}>Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <Navbar />
            <h1 className="quiz-title">Here are quizzes assigned to you!</h1>
            <div className="quiz-vessel">
                {data.length === 0 ? (
                    <h1 className="no-quizzes">No quizzes assigned to you as of now.</h1>
                ) : (
                    data.map((item) => {
                        const isCompleted = completedQuizzes.includes(item.id);
                        return (
                            <div key={item.id} className="quiz-box">
                                <div className="quiz-name">{item.heading}</div>
                                
                                {/* Show scheduling information */}
                                {item.is_scheduled && (
                                    <div className="quiz-schedule-info">
                                        <div className="schedule-item">
                                            <span className="schedule-label">Start:</span>
                                            <span className="schedule-time">
                                                {formatDate(item.scheduledStartDateTime)}
                                            </span>
                                        </div>
                                        <div className="schedule-item">
                                            <span className="schedule-label">End:</span>
                                            <span className="schedule-time">
                                                {formatDate(item.scheduledEndDateTime)}
                                            </span>
                                        </div>
                                        <div className="quiz-status">
                                            {isQuizAvailable(item) ? (
                                                <span className="status-available">🟢 Available Now</span>
                                            ) : isQuizUpcoming(item) ? (
                                                <span className="status-upcoming">🟡 Upcoming</span>
                                            ) : (
                                                <span className="status-expired">🔴 Expired</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                <button
                                    className={`attempt-button ${isCompleted ? 'completed' : ''} ${!isQuizAvailable(item) ? 'disabled' : ''}`}
                                    onClick={() => handleAttemptQuiz(item)}
                                    disabled={!isQuizAvailable(item)}
                                >
                                    {isCompleted ? "Attempt Again" : "Attempt Quiz"}
                                </button>
                                {isCompleted && (
                                    <>
                                        <div className="completed-tag">Completed</div>
                                        <button
                                            className="leaderboard-button"
                                            onClick={() => handleViewLeaderboard(item.id, item.heading)}
                                        >
                                            View Leaderboard
                                        </button>
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Guidelines Modal */}
            {showGuidelines && (
                <div className="guidelines-modal">
                    <div className="guidelines-content">
                        <h2>Quiz Guidelines</h2>
                        <div className="guidelines-list">
                            <p>1. The quiz will be in full-screen mode.</p>
                            <p>2. Switching tabs or pressing ESC more than once will auto-submit the quiz.</p>
                            <p>3. Each question has a time limit.</p>
                            <p>4. You cannot go back to previous questions.</p>
                            <p>5. Make sure you have a stable internet connection.</p>
                            <p>6. Do not refresh the page during the quiz.</p>
                        </div>
                        <div className="guidelines-buttons">
                            <button className="start-quiz-button" onClick={handleStartQuiz}>
                                Start Quiz
                            </button>
                            <button className="cancel-button" onClick={() => setShowGuidelines(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Quiz;