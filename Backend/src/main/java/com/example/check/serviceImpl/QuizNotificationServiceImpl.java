package com.example.check.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.check.model.QuizNotification;
import com.example.check.model.User;
import com.example.check.repository.QuizNotificationRepository;
import com.example.check.repository.UserRepository;
import com.example.check.service.QuizNotificationService;

@Service
public class QuizNotificationServiceImpl implements QuizNotificationService {

    @Autowired
    private QuizNotificationRepository quizNotificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public void createQuizNotifications(Long quizId, String quizTitle, LocalDateTime startTime, LocalDateTime endTime) {
        // Get all users to notify them about the new quiz (both students and admins)
        List<User> users = userRepository.findAll();
        System.out.println("Creating notifications for " + users.size() + " users");
        
        for (User user : users) {
            // Create notifications for all users (both students and admins)
            String message;
            if (startTime != null && endTime != null) {
                message = String.format("New scheduled quiz '%s' is available! Starts: %s, Ends: %s", 
                    quizTitle, 
                    startTime.format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm")),
                    endTime.format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm"))
                );
            } else {
                message = "New quiz '" + quizTitle + "' is now available!";
            }
            
            QuizNotification notification = new QuizNotification(
                quizId, 
                quizTitle, 
                user.getId(), 
                user.getUsername(), 
                startTime, 
                endTime
            );
            notification.setMessage(message);
            quizNotificationRepository.save(notification);
            System.out.println("Created notification for user: " + user.getUsername() + " - " + message);
        }
    }

    @Override
    public List<QuizNotification> getUserNotifications(Long userId) {
        return quizNotificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<QuizNotification> getUserNotificationsByUsername(String username) {
        System.out.println("Fetching notifications for username: " + username);
        List<QuizNotification> notifications = quizNotificationRepository.findByUsernameOrderByCreatedAtDesc(username);
        System.out.println("Found " + notifications.size() + " notifications for user: " + username);
        return notifications;
    }

    @Override
    public List<QuizNotification> getUnreadNotifications(Long userId) {
        return quizNotificationRepository.findUnreadNotificationsByUserId(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Optional<QuizNotification> notificationOpt = quizNotificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            QuizNotification notification = notificationOpt.get();
            notification.setStatus("READ");
            quizNotificationRepository.save(notification);
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<QuizNotification> unreadNotifications = getUnreadNotifications(userId);
        for (QuizNotification notification : unreadNotifications) {
            notification.setStatus("READ");
            quizNotificationRepository.save(notification);
        }
    }

    @Override
    public long getUnreadCount(Long userId) {
        return quizNotificationRepository.countUnreadNotificationsByUserId(userId);
    }

    @Override
    @Transactional
    public void deleteQuizNotifications(Long quizId) {
        List<QuizNotification> notifications = quizNotificationRepository.findByQuizIdOrderByCreatedAtDesc(quizId);
        quizNotificationRepository.deleteAll(notifications);
    }
} 