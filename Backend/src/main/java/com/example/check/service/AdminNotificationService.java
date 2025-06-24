package com.example.check.service;

import java.util.List;

import com.example.check.model.AdminNotification;

public interface AdminNotificationService {
    
    /**
     * Create a notification for admins
     */
    void createNotification(String type, String title, String message, Long relatedId, String relatedType, String senderName);
    
    /**
     * Get all admin notifications
     */
    List<AdminNotification> getAllNotifications();
    
    /**
     * Get unread notifications
     */
    List<AdminNotification> getUnreadNotifications();
    
    /**
     * Mark a notification as read
     */
    void markAsRead(Long notificationId);
    
    /**
     * Reply to a notification
     */
    void replyToNotification(Long notificationId, String reply);
    
    /**
     * Mark all notifications as read
     */
    void markAllAsRead();
    
    /**
     * Get count of unread notifications
     */
    long getUnreadCount();
    
    /**
     * Delete a notification
     */
    void deleteNotification(Long notificationId);
} 