package com.example.check.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.check.model.UserNotification;
import com.example.check.repository.UserNotificationRepository;
import com.example.check.service.UserNotificationService;

@Service
public class UserNotificationServiceImpl implements UserNotificationService {

    @Autowired
    private UserNotificationRepository userNotificationRepository;

    @Override
    @Transactional
    public void createNotification(Long userId, String type, String title, String message, Long relatedId, String relatedType) {
        UserNotification notification = new UserNotification(userId, type, title, message, relatedId, relatedType);
        userNotificationRepository.save(notification);
    }

    @Override
    public List<UserNotification> getUserNotifications(Long userId) {
        return userNotificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<UserNotification> getUnreadUserNotifications(Long userId) {
        return userNotificationRepository.findUnreadByUserId(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Optional<UserNotification> notificationOpt = userNotificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            UserNotification notification = notificationOpt.get();
            notification.setStatus("READ");
            notification.setReadAt(LocalDateTime.now());
            userNotificationRepository.save(notification);
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<UserNotification> unreadNotifications = getUnreadUserNotifications(userId);
        for (UserNotification notification : unreadNotifications) {
            notification.setStatus("READ");
            notification.setReadAt(LocalDateTime.now());
            userNotificationRepository.save(notification);
        }
    }

    @Override
    public long getUnreadCount(Long userId) {
        return userNotificationRepository.countUnreadByUserId(userId);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        userNotificationRepository.deleteById(notificationId);
    }
} 