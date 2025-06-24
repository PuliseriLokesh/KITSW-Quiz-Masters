import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import './Leaderboard.css';

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          navigate('/login', { replace: true });
          return;
        }

        const user = JSON.parse(userStr);
        if (!user.accessToken) {
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
          return;
        }

        const currentQuizStr = localStorage.getItem('currentQuiz');
        if (!currentQuizStr) {
          setError("No quiz selected. Please select a quiz to view its leaderboard.");
          setLoading(false);
          return;
        }

        const currentQuiz = JSON.parse(currentQuizStr);
        const { quizId, quizName } = currentQuiz;

        if (!quizId || !quizName) {
          setError("Invalid quiz data. Please select a quiz again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:7018/api/quiz/ScoreForAQuiz/${encodeURIComponent(quizName)}`,
          {
            headers: {
              'Authorization': `Bearer ${user.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const rankedData = response.data.map((entry, index) => ({
          id: index,
          username: entry.username,
          score: entry.number,
          rank: index + 1
        }));

        setLeaderboardData(rankedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
        } else {
          setError('Failed to fetch leaderboard data. Please try again later.');
        }
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [navigate]);

  const handleBack = () => {
    localStorage.removeItem('currentQuiz');
    navigate('/quizzes', { replace: true });
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    const fetchLeaderboardData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          navigate('/login', { replace: true });
          return;
        }

        const user = JSON.parse(userStr);
        if (!user.accessToken) {
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
          return;
        }

        const currentQuizStr = localStorage.getItem('currentQuiz');
        if (!currentQuizStr) {
          setError("No quiz selected. Please select a quiz to view its leaderboard.");
          setLoading(false);
          return;
        }

        const currentQuiz = JSON.parse(currentQuizStr);
        const { quizName } = currentQuiz;

        const response = await axios.get(
          `http://localhost:7018/api/quiz/ScoreForAQuiz/${encodeURIComponent(quizName)}`,
          {
            headers: {
              'Authorization': `Bearer ${user.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const rankedData = response.data.map((entry, index) => ({
          id: index,
          username: entry.username,
          score: entry.number,
          rank: index + 1
        }));

        setLeaderboardData(rankedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
        } else {
          setError('Failed to fetch leaderboard data. Please try again later.');
        }
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <Navbar />
        <div className="loading-container">
          <h2>Loading leaderboard...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <Navbar />
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <div className="button-group">
            <button 
              className="retry-button"
              onClick={handleRetry}
            >
              Retry
            </button>
            <button 
              className="back-button"
              onClick={handleBack}
            >
              <span role="img" aria-label="back">➡️</span> Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuiz = JSON.parse(localStorage.getItem('currentQuiz') || '{}');

  return (
    <div className="leaderboard-container">
      <Navbar />
      <h2>{currentQuiz.quizName} - Leaderboard</h2>
      {leaderboardData.length === 0 ? (
        <div className="no-data-message">
          <p>No scores available yet. Be the first to take this quiz!</p>
          <div className="leaderboard-actions">
            <button className="back-button" onClick={handleBack}>
              <span role="img" aria-label="back">➡️</span> Back to Quizzes
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="leaderboard-header">
            <span className="rank">Rank</span>
            <span className="username">Username</span>
            <span className="score">Score</span>
          </div>
          <div className="leaderboard-list">
            {leaderboardData.map((entry) => (
              <div 
                key={entry.id} 
                className={`leaderboard-row ${entry.rank <= 3 ? `top-${entry.rank}` : ''}`}
              >
                <span className="rank">
                  {entry.rank <= 3 ? (
                    <span className="medal">
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                    </span>
                  ) : (
                    entry.rank
                  )}
                </span>
                <span className="username">{entry.username}</span>
                <span className="score">{entry.score}</span>
              </div>
            ))}
          </div>
          <div className="leaderboard-actions">
            <button className="back-button" onClick={handleBack}>
              <span role="img" aria-label="back">➡️</span> Back to Quizzes
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Leaderboard; 