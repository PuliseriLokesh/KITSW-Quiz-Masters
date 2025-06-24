package com.example.check.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.check.model.QuizNotification;
import com.example.check.repository.QuizNotificationRepository;
import com.example.check.service.QuizNotificationService;

@RestController
@RequestMapping("/api/notifications")
public class QuizNotificationController {

    @Autowired
    private QuizNotificationService quizNotificationService;

    @Autowired
    private QuizNotificationRepository quizNotificationRepository;

    @GetMapping("/user")
    public ResponseEntity<List<QuizNotification>> getUserNotifications(Principal principal) {
        try {
            if (principal == null) {
                System.err.println("Principal is null in getUserNotifications");
                return ResponseEntity.status(401).build();
            }
            
            String username = principal.getName();
            System.out.println("Getting notifications for user: " + username);
            
            List<QuizNotification> notifications = quizNotificationService.getUserNotificationsByUsername(username);
            System.out.println("Found " + notifications.size() + " notifications for user: " + username);
            
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error in getUserNotifications: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/user/unread")
    public ResponseEntity<List<QuizNotification>> getUnreadNotifications(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).build();
            }
            
            String username = principal.getName();
            List<QuizNotification> allNotifications = quizNotificationService.getUserNotificationsByUsername(username);
            List<QuizNotification> unreadNotifications = allNotifications.stream()
                .filter(n -> "UNREAD".equals(n.getStatus()))
                .toList();
            return ResponseEntity.ok(unreadNotifications);
        } catch (Exception e) {
            System.err.println("Error in getUnreadNotifications: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/user/count")
    public ResponseEntity<Long> getUnreadCount(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).build();
            }
            
            String username = principal.getName();
            List<QuizNotification> allNotifications = quizNotificationService.getUserNotificationsByUsername(username);
            long unreadCount = allNotifications.stream()
                .filter(n -> "UNREAD".equals(n.getStatus()))
                .count();
            return ResponseEntity.ok(unreadCount);
        } catch (Exception e) {
            System.err.println("Error in getUnreadCount: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            quizNotificationService.markAsRead(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error in markAsRead: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/user/read-all")
    public ResponseEntity<?> markAllAsRead(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).build();
            }
            
            String username = principal.getName();
            List<QuizNotification> allNotifications = quizNotificationService.getUserNotificationsByUsername(username);
            for (QuizNotification notification : allNotifications) {
                if ("UNREAD".equals(notification.getStatus())) {
                    quizNotificationService.markAsRead(notification.getId());
                }
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error in markAllAsRead: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/create-test-notification")
    public ResponseEntity<String> createTestNotification(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body("No principal found");
            }
            
            String username = principal.getName();
            System.out.println("Creating test notification for user: " + username);
            
            // Create a test notification
            QuizNotification testNotification = new QuizNotification();
            testNotification.setQuizId(1L);
            testNotification.setQuizTitle("Test Quiz");
            testNotification.setUsername(username);
            testNotification.setMessage("This is a test notification for " + username);
            testNotification.setStatus("UNREAD");
            testNotification.setNotificationTime(java.time.LocalDateTime.now());
            testNotification.setCreatedAt(java.time.LocalDateTime.now());
            
            // Save the notification
            quizNotificationRepository.save(testNotification);
            
            return ResponseEntity.ok("Test notification created for user: " + username);
        } catch (Exception e) {
            System.err.println("Error creating test notification: " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("No principal found");
        }
        return ResponseEntity.ok("Hello " + principal.getName() + "! Authentication is working.");
    }

    @GetMapping("/all")
    public ResponseEntity<List<QuizNotification>> getAllNotifications() {
        try {
            List<QuizNotification> allNotifications = quizNotificationRepository.findAll();
            System.out.println("Total notifications in database: " + allNotifications.size());
            return ResponseEntity.ok(allNotifications);
        } catch (Exception e) {
            System.err.println("Error fetching all notifications: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
} 