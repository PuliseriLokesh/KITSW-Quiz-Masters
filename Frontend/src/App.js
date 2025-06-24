import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AddAQuestion from "./components/AddAQuestion/AddAQuestion";
import CreateQuiz from './components/CreateQuiz/CreateQuiz';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import AdminNotifications from './components/Dashboard/AdminNotifications';
import Dashboard from './components/Dashboard/Dashboard';
import ReportIssues from "./components/Dashboard/ReportIssues";
import UserReports from "./components/Dashboard/UserReports";
import AboutUs from "./components/Footer/AboutUs";
import ContactUs from "./components/Footer/ContactUs";
import Footer from "./components/Footer/Footer";
import TermsAndConditions from "./components/Footer/TermsAndConditions";
import GetAllQuiz from "./components/GetAllQuiz/GetAllQuiz";
import Home from "./components/Home/Home";
import Login from './components/Login/Login';
import ModifyQuiz from "./components/ModifyQuiz/ModifyQuiz";
import Notifications from "./components/Notifications/Notifications";
import Question from "./components/Questions/Questions";
import Leaderboard from './components/Quiz/Leaderboard';
import Quizzes from './components/Quiz/Quiz';
import QuizStats from "./components/QuizStats/QuizStats";
import Register from './components/Register/Register';
import Scores from './components/Score/Score';
import ScoresPage from "./components/ScoresPage/ScoresPage";
import StudentStats from "./components/StudentStats/StudentStats";
import SummaryQuiz from "./components/SummaryQuiz/SummaryQuiz";
import UpdateQuestion from "./components/UpdateQuestion/UpdateQuestion";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    return <Navigate to="/login" />;
  }

  try {
    const user = JSON.parse(userStr);
    if (!user?.accessToken) {
      localStorage.removeItem("user");
      return <Navigate to="/login" />;
    }
    return children;
  } catch (error) {
    localStorage.removeItem("user");
    return <Navigate to="/login" />;
  }
};

// Public Route Component (for login/register pages)
const PublicRoute = ({ children }) => {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    return children;
  }

  try {
    const user = JSON.parse(userStr);
    if (!user?.accessToken) {
      localStorage.removeItem("user");
      return children;
    }
    return <Navigate to="/dashboard" />;
  } catch (error) {
    localStorage.removeItem("user");
    return children;
  }
};

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <>
                <PublicRoute>
                  <Login />
                </PublicRoute>
                <Footer />
              </>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <PublicRoute>
                  <Register />
                </PublicRoute>
              </>
            }
          />
          <Route
            path="/"
            element={
              <>
                <Home />
                <Footer />
              </>
            }
          />

          {/* Protected Routes (require authentication) */}
          <Route
            path="/dashboard"
            element={
              <>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
                <Footer />
              </>
            }
          />
          <Route
            path="/quizzes"
            element={
              <>
              <ProtectedRoute>
                <Quizzes />
              </ProtectedRoute>
              <Footer />
              </>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions"
            element={
              <ProtectedRoute>
                <Question />
              </ProtectedRoute>
            }
          />
          <Route
            path="/score"
            element={
              <>
                <ProtectedRoute>
                  <Scores />
                </ProtectedRoute>
                <Footer />
              </>
            }
          />
          <Route
            path="/scores-page"
            element={
              <>
                <ProtectedRoute>
                  <ScoresPage />
                </ProtectedRoute>
                <Footer />
              </>
            }
          />
          <Route
            path="/admin-page"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute>
                <AdminNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-reports"
            element={
              <ProtectedRoute>
                <UserReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-reports"
            element={
              <ProtectedRoute>
                <UserReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-quiz"
            element={
              <ProtectedRoute>
                <CreateQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/see-all-quiz"
            element={
              <ProtectedRoute>
                <GetAllQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz-summary"
            element={
              <ProtectedRoute>
                <SummaryQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/updating-a-question"
            element={
              <ProtectedRoute>
                <UpdateQuestion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/modify-quiz"
            element={
              <ProtectedRoute>
                <ModifyQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-stats"
            element={
              <ProtectedRoute>
                <StudentStats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz-stats"
            element={
              <ProtectedRoute>
                <QuizStats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-a-question"
            element={
              <ProtectedRoute>
                <AddAQuestion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report-issues"
            element={
              <>
                <ReportIssues />
                <Footer />
              </>
            }
          />
          <Route
            path="/notifications"
            element={
              
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
                
            }
          />
         
          <Route
            path="/about-us"
            element={
              <>
                <AboutUs />
                <Footer />
              </>
            }
          />
          <Route
            path="/contact-us"
            element={
              <>
                <ContactUs />
                <Footer />
              </>
            }
          />
          <Route
            path="/terms-and-conditions"
            element={
              <>
                <TermsAndConditions />
                <Footer />
              </>
            }
          />

          {/* Fallback Route for 404 */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;