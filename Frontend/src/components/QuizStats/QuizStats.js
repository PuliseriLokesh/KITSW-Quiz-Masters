import Paper from "@mui/material/Paper";
import axios from "axios";
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { useLocation, useNavigate } from "react-router-dom";
import AdminNavbar from "../Navbar/AdminNavbar";
import "./QuizStats.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function QuizStats() {
  const location = useLocation();
  const navigate = useNavigate();
  const gg = JSON.parse(localStorage.getItem("user"));
  const [Data, setData] = useState([]);
  const totalQuestions = location.state.tem.questions.length;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch scores
        const scoresResponse = await axios.get(
          `http://localhost:7018/api/quiz/ScoreForAQuiz/${location.state.tem.heading}`,
          {
            headers: {
              Authorization: `Bearer ${gg.accessToken}`,
            },
          }
        );
        setData(scoresResponse.data);
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    };

    if (gg?.accessToken && location?.state?.tem?.heading) {
      fetchData();
    }
  }, [gg?.accessToken, location?.state?.tem?.heading]);

  useEffect(() => {
    document.body.classList.add('admin-page');
    return () => document.body.classList.remove('admin-page');
  }, []);

  const handleDeleteScores = async () => {
    if (!location.state.tem.heading) {
      alert("Quiz name not found!");
      return;
    }

    if (window.confirm("Are you sure you want to delete all scores for this quiz?")) {
      try {
        await axios.delete(
          `http://localhost:7018/api/quiz/deleteScoresByQuizName/${location.state.tem.heading}`,
          {
            headers: {
              Authorization: `Bearer ${gg.accessToken}`,
            },
          }
        );
        alert("Scores deleted successfully!");
        setData([]);
        navigate("/Admin-page");
      } catch (error) {
        console.error("Error deleting quiz scores:", error.response?.data || error.message);
        alert("Failed to delete scores. Please try again.");
      }
    }
  };

  // Calculate passing score (60% of total questions)
  const passingScore = Math.ceil(totalQuestions * 0.6);

  // Filter passed and failed candidates based on 60% criteria
  const passedCandidates = Data.filter((item) => item.number >= passingScore);
  const failedCandidates = Data.filter((item) => item.number < passingScore);

  // Sort candidates by score in descending order
  passedCandidates.sort((a, b) => b.number - a.number);
  failedCandidates.sort((a, b) => b.number - a.number);

  // Calculate score distribution for pie chart
  const scoreRanges = {
    "90-100%": 0,
    "80-89%": 0,
    "70-79%": 0,
    "60-69%": 0,
    "0-59%": 0,
  };

  Data.forEach((item) => {
    const percentage = (item.number / totalQuestions) * 100;
    if (percentage >= 90) scoreRanges["90-100%"]++;
    else if (percentage >= 80) scoreRanges["80-89%"]++;
    else if (percentage >= 70) scoreRanges["70-79%"]++;
    else if (percentage >= 60) scoreRanges["60-69%"]++;
    else scoreRanges["0-59%"]++;
  });

  // Chart data
  const barChartData = {
    labels: ["Passed", "Failed"],
    datasets: [
      {
        label: "Number of Candidates",
        data: [passedCandidates.length, failedCandidates.length],
        backgroundColor: ["#28a745", "#dc3545"], // Green for passed, Red for failed
        borderColor: ["#1e7e34", "#bd2130"],
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: Object.keys(scoreRanges),
    datasets: [
      {
        data: Object.values(scoreRanges),
        backgroundColor: [
          "#28a745", // 90-100%
          "#5cb85c", // 80-89%
          "#ffc107", // 70-79%
          "#fd7e14", // 60-69%
          "#dc3545", // 0-59%
        ],
        borderColor: [
          "#1e7e34",
          "#449d44",
          "#d39e00",
          "#d35400",
          "#bd2130",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow custom height
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: "Passed vs Failed Candidates",
        font: { 
          size: 20,
          weight: 'bold'
        },
        padding: 20
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Candidates",
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: "Score Distribution",
        font: { 
          size: 20,
          weight: 'bold'
        },
        padding: 20
      },
    },
  };

  return (
    <div className="quiz-stats-wrapper">
      <AdminNavbar />
      <div className="heading">
        <h1>Quiz Performance Overview</h1>
        <p className="notice">
          Note: In case of a tie, the one who submitted first will be ranked higher.
          Passing criteria: Minimum {passingScore} out of {totalQuestions} marks (60%) required to pass.
        </p>
        <button className="delete-scores-btn" onClick={handleDeleteScores}>
          Delete All Scores
        </button>
      </div>

      <div className="charts-container">
        <div className="chart-field">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
        <div className="chart-field">
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
      </div>

      <div className="quizzy">
        <h2>Passed Candidates</h2>
        {passedCandidates.length === 0 ? (
          <h2 className="no-results">Nobody Passed the Quiz</h2>
        ) : (
          <div className="candidate-list">
            {passedCandidates.map((item, index) => (
              <Paper key={item.id} className="candidate-card passed">
                <h3 className="candidate-rank">Rank: {index + 1}</h3>
                <p className="candidate-username">Username: {item.username}</p>
                <p className="candidate-marks">
                  Marks: {item.number}/{totalQuestions} ({Math.round((item.number / totalQuestions) * 100)}%)
                </p>
              </Paper>
            ))}
          </div>
        )}
      </div>

      <div className="failed">
        <h3>Failed Candidates</h3>
        {failedCandidates.length === 0 ? (
          <h2 className="no-results">Nobody Failed the Quiz</h2>
        ) : (
          <div className="candidate-list">
            {failedCandidates.map((item) => (
              <Paper key={item.id} className="candidate-card failed">
                <p className="candidate-username">Username: {item.username}</p>
                <p className="candidate-marks">
                  Marks: {item.number}/{totalQuestions} ({Math.round((item.number / totalQuestions) * 100)}%)
                </p>
              </Paper>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizStats;