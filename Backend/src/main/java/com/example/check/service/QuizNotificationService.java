package com.example.check.service;

import com.example.check.model.QuizNotification;
import java.util.List;
import java.time.LocalDateTime;

public interface QuizNotificationService {
    
    /**
     * Create notifications for all users when a quiz is scheduled
     */
    void createQuizNotifications(Long quizId, String quizTitle, LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * Get notifications for a specific user
     */
    List<QuizNotification> getUserNotifications(Long userId);
    
    /**
     * Get notifications for a specific user by username
     */
    List<QuizNotification> getUserNotificationsByUsername(String username);
    
    /**
     * Get unread notifications for a user
     */
    List<QuizNotification> getUnreadNotifications(Long userId);
    
    /**
     * Mark a notification as read
     */
    void markAsRead(Long notificationId);
    
    /**
     * Mark all notifications as read for a user
     */
    void markAllAsRead(Long userId);
    
    /**
     * Get count of unread notifications for a user
     */
    long getUnreadCount(Long userId);
    
    /**
     * Delete notifications for a specific quiz
     */
    void deleteQuizNotifications(Long quizId);
} 