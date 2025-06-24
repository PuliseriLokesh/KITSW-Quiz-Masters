package com.example.check.service;

import java.util.List;

import com.example.check.model.UserNotification;

public interface UserNotificationService {
    
    /**
     * Create a notification for a user
     */
    void createNotification(Long userId, String type, String title, String message, Long relatedId, String relatedType);
    
    /**
     * Get all notifications for a user
     */
    List<UserNotification> getUserNotifications(Long userId);
    
    /**
     * Get unread notifications for a user
     */
    List<UserNotification> getUnreadUserNotifications(Long userId);
    
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
     * Delete a notification
     */
    void deleteNotification(Long notificationId);
} 