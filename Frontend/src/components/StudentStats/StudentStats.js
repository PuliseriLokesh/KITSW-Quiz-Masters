import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import axios from "axios";
import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../Navbar/AdminNavbar";
import "./StudentStats.css";

function StudentStats() {
  const history = useNavigate();
  const gg = JSON.parse(localStorage.getItem("user"));
  const [Data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get(
          `http://localhost:7018/api/quiz/getAllQuizzes`,
          {
            headers: {
              Authorization: "Bearer " + gg?.accessToken,
            },
          }
        );
        console.log(result.data);
        setData(result.data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    if (gg?.accessToken) {
      fetchData();
    }
  }, [gg?.accessToken]);

  useEffect(() => {
    document.body.classList.add('admin-page');
    return () => document.body.classList.remove('admin-page');
  }, []);

  return (
    <div className="student-stats-wrapper">
      <AdminNavbar />
      <div className="heading">
        <h1>Welcome to Quiz Stats, Admin!</h1>
        <div className="back-button">
          <Button variant="secondary" onClick={() => history("/Admin-page")}>
            ⬅️ Back to Admin Page
          </Button>
        </div>
      </div>

      <div className="quizzy">
        {Data.length === 0 ? (
          <div className="no-quizzes">
            <h2>No quizzes created as of now.</h2>
          </div>
        ) : (
          <TableContainer component={Paper} className="quiz-table">
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">Quiz Name</TableCell>
                  <TableCell align="right" className="table-header">Stats</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Data.map((item) => (
                  <TableRow
                    key={item.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    className="table-row"
                  >
                    <TableCell component="th" scope="row" className="quiz-name">
                      {item.heading}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="primary"
                        className="view-stats-btn"
                        onClick={() => history("/quiz-stats", { state: { tem: item } })}
                      >
                        📊 View Stats
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  );
}

export default StudentStats;
