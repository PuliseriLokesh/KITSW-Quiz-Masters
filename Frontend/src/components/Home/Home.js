import React from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import gif from './homegif.gif';
import logo from './logo.png';

function Home() {
  const history = useNavigate();

  return (
    <div className="home-container">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="nav-content">
          <div className="logo-section">
            <img src={logo} alt="KITS Quiz Masters Logo" className="logo" />
            <h2>KITS Quiz Masters</h2>
          </div>
          <div className="auth-buttons">
            <Button 
              variant="primary" 
              className="auth-button login-btn"
              onClick={() => history("/login")}
            >
              Login
            </Button>
            <Button 
              variant="outline-primary" 
              className="auth-button register-btn"
              onClick={() => history("/register")}
            >
              Register
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to KITS Quiz Masters</h1>
          <p className="hero-subtitle">Test Your Knowledge, Challenge Your Mind</p>
          <div className="hero-buttons">
            <Button 
              variant="primary" 
              size="lg" 
              className="hero-button"
              onClick={() => history("/register")}
            >
              Get Started
            </Button>
            <Button 
              variant="outline-primary" 
              size="lg" 
              className="hero-button"
              onClick={() => history("/login")}
            >
              Sign In
            </Button>
          </div>
        </div>
        <div className="hero-image">
          <img src={gif} alt="Quiz Animation" className="hero-gif" />
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">Why Choose KITS Quiz Masters?</h2>
        <Container>
          <Row className="justify-content-center">
            <Col md={4} className="mb-4">
              <Card className="feature-card">
                <Card.Body>
                  <div className="feature-icon">📚</div>
                  <Card.Title>Diverse Topics</Card.Title>
                  <Card.Text>
                    Access a wide range of quizzes covering various subjects and topics
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card">
                <Card.Body>
                  <div className="feature-icon">🎯</div>
                  <Card.Title>Track Progress</Card.Title>
                  <Card.Text>
                    Monitor your performance and see your improvement over time
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card">
                <Card.Body>
                  <div className="feature-icon">🏆</div>
                  <Card.Title>Compete</Card.Title>
                  <Card.Text>
                    Challenge yourself and compete with other students
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Call to Action Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Quiz Journey?</h2>
          <p>Join thousands of students who are already learning and growing with KITS Quiz Masters</p>
          <Button 
            variant="primary" 
            size="lg" 
            className="cta-button"
            onClick={() => history("/register")}
          >
            Start Now
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Home;