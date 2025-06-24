import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import "./Score.css";
import celebrationGif from './celebration.gif';

function Score() {
    const location = useLocation();
    const navigate = useNavigate();
    const score = location.state?.score || 0;
    const totalQuestions = location.state?.totalQuestions || 0;
    const heading = location.state?.heading_of_quiz || "Quiz";
    const attemptedQuestions = location.state?.attemptedQuestions || 0;
    const answers = location.state?.answers || [];
    const quizId = location.state?.id;
    const [showCelebration, setShowCelebration] = useState(true);
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        // Prevent horizontal navigation gestures
        const preventHorizontalNavigation = (e) => {
            // Check if the gesture is horizontal
            if (e.type === 'wheel') {
                if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                    e.preventDefault();
                }
            } else if (e.type === 'touchmove') {
                const touch = e.touches[0];
                const startX = touch.clientX;
                const startY = touch.clientY;
                
                if (Math.abs(startX) > Math.abs(startY)) {
                    e.preventDefault();
                }
            }
        };

        // Add event listeners for horizontal navigation gestures
        document.addEventListener('wheel', preventHorizontalNavigation, { passive: false });
        document.addEventListener('touchmove', preventHorizontalNavigation, { passive: false });

        // Replace history state
        window.history.replaceState(null, '', '/score');
        window.history.pushState(null, '', '/score');

        // Handle popstate event
        const handlePopState = (e) => {
            e.preventDefault();
            window.history.pushState(null, '', '/score');
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            // Clean up event listeners
            document.removeEventListener('wheel', preventHorizontalNavigation);
            document.removeEventListener('touchmove', preventHorizontalNavigation);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    useEffect(() => {
        const submitScore = async () => {
            try {
                await axios.post(
                    "http://localhost:7018/api/quiz/addScore",
                    {
                        username: user.username,
                        quizId: quizId,
                        quizname: heading,
                        score: score
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${user.accessToken}`,
                        },
                    }
                );
                console.log("Score submitted successfully");
            } catch (error) {
                console.error("Error submitting score:", error);
            }
        };

        if (quizId && user) {
            submitScore();
        }
    }, [quizId, user, score, heading]);

    useEffect(() => {
        if (score / totalQuestions >= 0.6) {
            const timer = setTimeout(() => {
                setShowCelebration(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [score, totalQuestions]);

    const handleBackToDashboard = () => {
        // Clear all history and navigate to dashboard
        window.history.pushState(null, '', '/dashboard');
        navigate("/dashboard", { replace: true });
    };

    const percentage = (score / totalQuestions) * 100;
    const hasPassed = percentage >= 60;
    const isPerfectScore = percentage === 100;

    const getScoreColor = () => {
        if (percentage >= 80) return "#28a745";
        if (percentage >= 60) return "#ffc107";
        return "#dc3545";
    };

    const getScoreMessage = () => {
        if (isPerfectScore) return "🏆 Perfect Score! You're a Quiz Master! 🏆";
        if (percentage >= 80) return "🎉 Excellent! You've mastered this quiz! 🎉";
        if (percentage >= 60) return "🌟 Good job! Keep practicing to improve. 🌟";
        return "💪 Keep practicing! You can do better next time. 💪";
    };

    return (
        <div className="score-page">
            <Navbar />
            <div className={`score-container ${hasPassed && showCelebration ? 'with-celebration' : ''}`}>
                {hasPassed && showCelebration && (
                    <div className="celebration-background">
                        <img src={celebrationGif} alt="Celebration" className="celebration-gif" />
                    </div>
                )}
                <div className="score-card">
                    <h1 className="score-title">Quiz Results</h1>
                    <h2 className="quiz-name">{heading}</h2>
                    
                    <div className="score-details">
                        <div className="score-circle" style={{ borderColor: getScoreColor() }}>
                            <span className="score-percentage">{percentage.toFixed(1)}%</span>
                        </div>
                        
                        <div className="score-stats">
                            <div className="stat-item">
                                <span className="stat-label">Correct Answers:</span>
                                <span className="stat-value">{score}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Total Questions:</span>
                                <span className="stat-value">{totalQuestions}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Questions Attempted:</span>
                                <span className="stat-value">{attemptedQuestions}</span>
                            </div>
                        </div>
                    </div>

                    <div className="score-message" style={{ color: getScoreColor() }}>
                        {getScoreMessage()}
                    </div>

                    <div className="answers-summary">
                        <h3>Question Summary</h3>
                        <div className="answers-list">
                            {answers.map((answer, index) => (
                                <div key={index} className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                                    <div className="question-number">Q{index + 1}</div>
                                    <div className="answer-details">
                                        <div className="question-text">{answer.question}</div>
                                        <div className="answer-text">
                                            <span className="label">Your Answer:</span> {answer.userAnswer}
                                        </div>
                                        {!answer.isCorrect && (
                                            <div className="correct-answer">
                                                <span className="label">Correct Answer:</span> {answer.correctAnswer}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="score-actions">
                        <button className="dashboard-button" onClick={handleBackToDashboard}>
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Score;