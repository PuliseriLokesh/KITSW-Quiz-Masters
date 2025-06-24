import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Bar, BarChart, Tooltip as BarTooltip, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Navbar from "../Navbar/Navbar";
import "./ScoresPage.css";

function ScorePage() {
  const gg = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizQuestionCounts, setQuizQuestionCounts] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch scores
        const scoresResult = await axios.get(`http://localhost:7018/api/quiz/getAllScores`, {
          headers: { Authorization: "Bearer " + gg.accessToken },
        });
        setData(scoresResult.data || []);

        // Fetch quiz details to get total questions
        const quizResult = await axios.get(`http://localhost:7018/api/quiz/getAllQuizzes`, {
          headers: { Authorization: "Bearer " + gg.accessToken },
        });
        
        // Create a map of quiz IDs to their total questions
        const quizMap = {};
        quizResult.data.forEach(quiz => {
          quizMap[quiz.id] = quiz.questions.length;
        });
        setQuizQuestionCounts(quizMap);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (gg?.accessToken) fetchData();
    else setError("You are not logged in. Please log in to view your scores.");
  }, [gg?.accessToken]);

  const processData = () => {
    const groupedByQuizAndUser = new Map();
    
    data.forEach((item) => {
      const key = `${item.quizname || "Unknown Quiz"}-${item.username}`;
      if (!groupedByQuizAndUser.has(key)) {
        groupedByQuizAndUser.set(key, []);
      }
      groupedByQuizAndUser.get(key).push(item);
    });
    
    const processedData = [];
    
    groupedByQuizAndUser.forEach((attempts, key) => {
      const [quizname] = key.split("-");
      attempts.sort((a, b) => a.id - b.id);
      
      const uniqueAttempts = [];
      const seenScores = new Set();
      
      attempts.forEach(attempt => {
        const scoreKey = `${attempt.score}`;
        if (!seenScores.has(scoreKey)) {
          seenScores.add(scoreKey);
          uniqueAttempts.push(attempt);
        }
      });
      
      uniqueAttempts.forEach((item, index) => {
        const totalQuestions = quizQuestionCounts[item.quizId] || 0;
        const percentage = totalQuestions > 0 ? (item.score / totalQuestions) * 100 : 0;
        
        processedData.push({
          id: item.id,
          quizname,
          username: item.username,
          score: item.score,
          totalQuestions,
          percentage,
          attemptNumber: index + 1,
          status: getScoreStatus(percentage),
          improvement: getImprovementSuggestion(percentage, index + 1, uniqueAttempts.length)
        });
      });
    });
    
    processedData.sort((a, b) => {
      if (a.quizname !== b.quizname) {
        return a.quizname.localeCompare(b.quizname);
      }
      return a.attemptNumber - b.attemptNumber;
    });

    return processedData;
  };

  const getScoreStatus = (percentage) => {
    if (percentage >= 90) return { label: "Excellent", color: "#166534", bgColor: "#dcfce7" };
    if (percentage >= 80) return { label: "Very Good", color: "#15803d", bgColor: "#bbf7d0" };
    if (percentage >= 70) return { label: "Good", color: "#854d0e", bgColor: "#fef9c3" };
    if (percentage >= 60) return { label: "Pass", color: "#854d0e", bgColor: "#fef9c3" };
    return { label: "Needs Improvement", color: "#991b1b", bgColor: "#fee2e2" };
  };

  const getImprovementSuggestion = (percentage, attemptNumber, totalAttempts) => {
    if (percentage >= 90) {
      return "Outstanding performance! Keep up the good work.";
    }
    if (percentage >= 80) {
      return "Great job! Try to aim for even higher scores.";
    }
    if (percentage >= 70) {
      return "Good effort! Focus on the areas where you lost points.";
    }
    if (percentage >= 60) {
      return "You've passed, but there's room for improvement. Review the questions you got wrong.";
    }
    if (attemptNumber < totalAttempts) {
      return "Try again! Review the material and attempt the quiz once more.";
    }
    return "Consider reviewing the study material and practicing more before your next attempt.";
  };

  const displayData = processData();

  // Pie Chart Data with better formatting
  const pieData = displayData.length > 0 ? [
    { 
      name: "Average Score", 
      value: displayData.reduce((sum, item) => sum + item.percentage, 0) / displayData.length,
      color: "#3498db"
    },
    { 
      name: "Remaining Points", 
      value: 100 - (displayData.reduce((sum, item) => sum + item.percentage, 0) / displayData.length),
      color: "#e74c3c"
    },
  ] : [];

  // Bar Chart Data with better formatting
  const barData = displayData.map(item => ({
    name: item.quizname,
    attempt: `Attempt ${item.attemptNumber}`,
    score: item.percentage,
    fill: item.percentage >= 80 ? "#2ecc71" : item.percentage >= 60 ? "#f1c40f" : "#e74c3c"
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <p style={{ 
            margin: '0 0 8px 0',
            color: '#2d3748',
            fontWeight: '600',
            fontSize: '14px'
          }}>{label}</p>
          <p style={{ 
            margin: '0 0 4px 0',
            color: '#4a5568',
            fontSize: '13px'
          }}>{payload[0].payload.attempt}</p>
          <p style={{ 
            margin: 0,
            color: payload[0].payload.fill,
            fontWeight: '500',
            fontSize: '14px'
          }}>Score: {payload[0].value.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: '600' }}
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="scorepage-container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2 style={{ color: '#2d3748' }}>Loading your scores...</h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="scorepage-container">
        <h1 className="scorepage-title">Your Quiz Performance</h1>
        {error ? (
          <h2 className="error-message">{error}</h2>
        ) : data.length === 0 ? (
          <h2 className="no-data-message">You haven't played any quiz yet.</h2>
        ) : (
          <div className="scorepage-content">
            {/* Pie Chart */}
            <div className="chart-section">
              <h3>Overall Performance</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={renderCustomizedLabel}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toFixed(1) + '%'} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="chart-section">
              <h3>Score Distribution</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={barData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    barSize={40}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      label={{ 
                        value: 'Score (%)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fontSize: 12, fill: '#2d3748' }
                      }}
                    />
                    <BarTooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="score" 
                      radius={[4, 4, 0, 0]}
                    >
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scores Table */}
            <div className="scores-table">
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="scores table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Quiz Name</TableCell>
                      <TableCell align="right">Attempt Number</TableCell>
                      <TableCell align="right">Score</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                      <TableCell align="right">Status</TableCell>
                      <TableCell>Improvement Suggestion</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayData.map((item) => (
                      <TableRow 
                        key={item.id} 
                        sx={{ 
                          "&:last-child td, &:last-child th": { border: 0 },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <TableCell component="th" scope="row">{item.quizname}</TableCell>
                        <TableCell align="right">{item.attemptNumber}</TableCell>
                        <TableCell align="right">{item.score}/{item.totalQuestions}</TableCell>
                        <TableCell align="right">{item.percentage.toFixed(1)}%</TableCell>
                        <TableCell align="right">
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: item.status.bgColor,
                            color: item.status.color,
                            fontWeight: '500'
                          }}>
                            {item.status.label}
                          </span>
                        </TableCell>
                        <TableCell style={{ maxWidth: '300px' }}>
                          <span style={{ color: '#4a5568' }}>
                            {item.improvement}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ScorePage;