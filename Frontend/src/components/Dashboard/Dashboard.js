import axios from "axios";
import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import "./Dashboard.css";

function Dashboard() {
  const gg = JSON.parse(localStorage.getItem("user")) || {};
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const navigate = useNavigate();

  // Fetch quiz scores and calculate accuracy
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all scores
        const scoresResponse = await axios.get(
          `http://localhost:7018/api/quiz/getAllScores`,
          {
            headers: {
              Authorization: "Bearer " + gg.accessToken,
            },
          }
        );

        // Fetch all quizzes to get question counts
        const quizzesResponse = await axios.get(
          `http://localhost:7018/api/quiz/getAllQuizzes`,
          {
            headers: {
              Authorization: "Bearer " + gg.accessToken,
            },
          }
        );

        // Create a map of quizId to number of questions
        const quizQuestionCounts = {};
        quizzesResponse.data.forEach(quiz => {
          quizQuestionCounts[quiz.id] = quiz.questions.length;
        });

        // Calculate overall accuracy
        if (scoresResponse.data.length > 0) {
          let totalScore = 0;
          let totalQuestions = 0;

          scoresResponse.data.forEach(score => {
            const questionCount = quizQuestionCounts[score.quizId] || 0;
            totalScore += score.score;
            totalQuestions += questionCount;
          });

          const accuracy = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
          setOverallAccuracy(Math.round(accuracy));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (gg?.accessToken) {
      fetchData();
    }
  }, [gg?.accessToken]);

  // Handle profile photo upload
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        localStorage.setItem("profilePhoto", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load profile photo from localStorage on mount
  useEffect(() => {
    const savedPhoto = localStorage.getItem("profilePhoto");
    if (savedPhoto) {
      setProfilePhoto(savedPhoto);
    }
  }, []);

  // Button Handlers
  const handleReportIssues = () => {
    alert("Redirecting to report issues...");
    navigate("/report-issues");
  };

  const handleViewRecentQuizzes = () => {
    navigate("/scores-page"); // Navigate to the ScoresPage component
  };

  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-details">
            <h2>Welcome, {gg.username || "Guest"}</h2>
            <p>Email: {gg.email || "Not provided"}</p>
            <p>Organization: Power Programmer's Quiz</p>
            <p>Batch: 2022-2026</p>
            <p>ID No: {gg.id || "N/A"}</p>
            <div className="profile-actions">
              <button className="report-issues" onClick={handleReportIssues}>
                Report Issues
              </button>
              <button
                className="logout"
                onClick={() => {
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
              >
                Logout
              </button>
            </div>
          </div>
          <div className="profile-photo">
            <div onClick={openModal} style={{ cursor: 'pointer' }}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" />
              ) : (
                <div className="photo-placeholder">No Photo</div>
              )}
            </div>
            <div className="photo-actions">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                id="photo-upload"
                style={{ display: "none" }}
              />
              <label htmlFor="photo-upload" className="upload-photo-btn">
                Upload Photo
              </label>
              {profilePhoto && (
                <button
                  className="remove-photo-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent modal from opening
                    setProfilePhoto(null);
                    localStorage.removeItem("profilePhoto");
                  }}
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="overall-accuracy">
          <h3>Your Overall Accuracy</h3>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${overallAccuracy}%` }}
            ></div>
            <span className="progress-label">{overallAccuracy}%</span>
          </div>
        </div>

        {/* Button to View Previous Quiz Results */}
        <div className="activity-sections">
          <button className=" view-btn" onClick={handleViewRecentQuizzes}>
            View Recent Quizzes
          </button>
        </div>

        {/* Modal for Zoomed Profile Photo */}
        {isModalOpen && (
          <div className="modal" onClick={closeModal}>
            <img src={profilePhoto} alt="Zoomed Profile" />
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;