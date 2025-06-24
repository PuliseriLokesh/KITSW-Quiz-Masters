import React from 'react';
import Navbar from '../Navbar/Navbar';
import './TermsAndConditions.css';

const TermsAndConditions = () => {
    return (
        <>
            <Navbar />
            <div className="terms-and-conditions">
                <div>
                    <h1>Terms and Conditions</h1>
                    <p>Welcome to KITS Quiz Masters. By accessing and using our platform, you agree to comply with and be bound by the following terms and conditions. These terms govern your use of the website and the services provided herein. If you do not agree with any part of these terms, please refrain from using our site.</p>

                    <h2>1. Platform Overview</h2>
                    <p>KITS Quiz Masters is a comprehensive quiz application that provides educational assessment tools for students and administrative capabilities for educators. Our platform includes features such as interactive quizzes, performance analytics, real-time notifications, reporting systems, and administrative tools for quiz management.</p>

                    <h2>2. User Registration and Authentication</h2>
                    <p>To access the full features of KITS Quiz Masters, users must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. Our platform uses JWT-based authentication to ensure secure access to your account.</p>

                    <h2>3. User Roles and Permissions</h2>
                    <p>Our platform supports multiple user roles:</p>
                    <ul>
                        <li><strong>Students:</strong> Can take quizzes, view performance analytics, access leaderboards, submit reports, and receive notifications</li>
                        <li><strong>Administrators:</strong> Can create and manage quizzes, monitor user activities, handle reports, and access comprehensive analytics</li>
                    </ul>

                    <h2>4. Quiz Participation and Conduct</h2>
                    <p>Users are expected to engage with quizzes honestly and responsibly. Any form of cheating, including but not limited to using external resources during timed quizzes, sharing answers, or attempting to manipulate the system, is strictly prohibited. Users must respect the scheduled timing of quizzes and complete them within the designated timeframes.</p>

                    <h2>5. Content and Intellectual Property</h2>
                    <p>All content, features, and functionality on KITS Quiz Masters, including but not limited to text, graphics, logos, software, quiz questions, and user interface elements, are the exclusive property of the platform and are protected by copyright, trademark, and other intellectual property laws. Users may not reproduce, distribute, or create derivative works without explicit permission.</p>

                    <h2>6. Reporting and Communication</h2>
                    <p>Our platform provides reporting and communication features that allow users to submit issues, suggestions, or contact administrators. Users agree to use these features responsibly and to provide accurate, constructive feedback. False reports or abusive communication will not be tolerated and may result in account suspension.</p>

                    <h2>7. Data Privacy and Security</h2>
                    <p>We are committed to protecting your privacy and maintaining the security of your data. Our platform implements industry-standard security measures including JWT authentication, encrypted data transmission, and secure database storage. User data is collected and processed in accordance with our privacy policy and applicable data protection laws.</p>

                    <h2>8. Performance Analytics and Data Usage</h2>
                    <p>Our platform collects and analyzes user performance data to provide personalized insights and improve the learning experience. This data includes quiz scores, completion times, and performance trends. Users consent to the collection and analysis of this data for educational and platform improvement purposes.</p>

                    <h2>9. Notification System</h2>
                    <p>KITS Quiz Masters includes a comprehensive notification system that provides real-time updates about quiz schedules, admin responses, and system events. Users may receive notifications through the platform interface. Users can manage their notification preferences within their account settings.</p>

                    <h2>10. Technical Requirements and Compatibility</h2>
                    <p>Our platform is designed to work across modern web browsers and devices. Users are responsible for ensuring their devices meet the minimum technical requirements for optimal platform performance. We recommend using the latest versions of supported browsers for the best experience.</p>

                    <h2>11. Limitation of Liability</h2>
                    <p>KITS Quiz Masters is provided on an "as-is" basis. We do not warrant that the platform will be uninterrupted or error-free. While we strive to maintain high availability and performance, we cannot guarantee that the service will be available at all times. In no event shall we be liable for any direct, indirect, incidental, or consequential damages arising from the use of or inability to use the platform.</p>

                    <h2>12. Service Modifications and Updates</h2>
                    <p>We reserve the right to modify, update, or discontinue any aspect of KITS Quiz Masters at any time. This includes but is not limited to adding new features, modifying existing functionality, or updating the user interface. Users will be notified of significant changes through the platform's notification system.</p>

                    <h2>13. Termination and Account Suspension</h2>
                    <p>We reserve the right to terminate or suspend user accounts for violations of these terms and conditions, including but not limited to academic dishonesty, abusive behavior, or repeated violations of platform policies. Users may also terminate their accounts at any time through their account settings.</p>

                    <h2>14. Governing Law and Dispute Resolution</h2>
                    <p>These terms and conditions are governed by the laws of the jurisdiction in which Kakatiya Institute of Technology operates. Any disputes arising from the use of KITS Quiz Masters shall be resolved through appropriate legal channels in accordance with applicable laws.</p>

                    <h2>15. Contact Information</h2>
                    <p>For questions, concerns, or support related to these terms and conditions or the KITS Quiz Masters platform, users can contact our support team through the platform's reporting system or contact form.</p>

                    <p>By using KITS Quiz Masters, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions. These terms constitute a legally binding agreement between you and the platform. Thank you for being a part of our learning community!</p>
                </div>
            </div>
        </>
    );
};

export default TermsAndConditions;
