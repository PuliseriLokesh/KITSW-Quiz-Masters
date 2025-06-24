import React from 'react';
import Navbar from '../Navbar/Navbar';

import './AboutUs.css';

const AboutUs = () => {
    return (
        <>
            <Navbar />
            <div className="about-us">
                <div>
                    <h1>About KITS Quiz Masters</h1>
                    <p>Welcome to KITS Quiz Masters, a comprehensive quiz application developed by students from Kakatiya Institute of Technology. Our platform offers advanced features for both students and administrators, creating an engaging learning environment.</p>

                    <h2>Student Features</h2>
                    <ul>
                        <li><strong>User Authentication:</strong> Secure login/registration with profile photo management</li>
                        <li><strong>Interactive Quizzes:</strong> Take quizzes with real-time feedback and immediate scoring</li>
                        <li><strong>Performance Dashboard:</strong> View quiz history, average scores, and performance trends with visual charts</li>
                        <li><strong>Leaderboard System:</strong> Compete with peers and view rankings for each quiz</li>
                        <li><strong>Smart Notifications:</strong> Real-time updates for quiz schedules and admin responses</li>
                        <li><strong>Report System:</strong> Submit issues, suggestions, or contact administrators with priority levels</li>
                        <li><strong>User Reports Dashboard:</strong> Track submitted reports and view admin responses</li>
                        <li><strong>Responsive Design:</strong> Works seamlessly across all devices</li>
                    </ul>

                    <h2>Administrator Features</h2>
                    <ul>
                        <li><strong>Quiz Management:</strong> Create, modify, and delete quizzes with unlimited questions</li>
                        <li><strong>Question Management:</strong> Add, edit, and organize questions with detailed content</li>
                        <li><strong>Scheduled Quizzes:</strong> Set up time-bound quizzes with specific start/end times</li>
                        <li><strong>Analytics Dashboard:</strong> View detailed statistics and user performance metrics</li>
                        <li><strong>Notification System:</strong> Manage user reports, contact messages, and system notifications</li>
                        <li><strong>User Monitoring:</strong> Track user activities, scores, and engagement patterns</li>
                        <li><strong>Real-time Monitoring:</strong> Monitor pending reports and system status</li>
                        <li><strong>Security:</strong> JWT-based authentication with role-based access control</li>
                    </ul>

                    <h2>Technical Features</h2>
                    <ul>
                        <li><strong>Frontend:</strong> React.js with Material-UI components</li>
                        <li><strong>Backend:</strong> Spring Boot with JPA/Hibernate</li>
                        <li><strong>Database:</strong> MySQL for reliable data storage</li>
                        <li><strong>Security:</strong> JWT authentication, CORS configuration, input validation</li>
                        <li><strong>Real-time Updates:</strong> Instant notifications and live data updates</li>
                        <li><strong>Data Visualization:</strong> Interactive charts and performance graphs</li>
                        <li><strong>Error Handling:</strong> Comprehensive error management with user-friendly messages</li>
                        <li><strong>Cross-platform:</strong> Works across all modern browsers and devices</li>
                    </ul>

                    <h2>Educational Impact</h2>
                    <p>Our platform goes beyond traditional quiz systems by providing comprehensive learning management capabilities. Students can track progress, identify improvement areas, and engage in healthy competition. Educators benefit from detailed analytics to optimize teaching strategies.</p>

                    <h2>Our Team</h2>
                    <p>This project represents the collaborative effort of four passionate developers from Kakatiya Institute of Technology. Each member contributed expertise in frontend development, backend architecture, database design, and user experience optimization.</p>

                    <p className="closing-statement">Thank you for choosing KITS Quiz Masters. We hope our platform enhances your learning journey!</p>
                </div>
            </div>
        </>
    );
};

export default AboutUs; 
