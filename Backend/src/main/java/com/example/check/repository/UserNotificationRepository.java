package com.example.check.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.check.model.UserNotification;

@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    
    List<UserNotification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT n FROM UserNotification n WHERE n.userId = ?1 AND n.status = 'UNREAD'")
    List<UserNotification> findUnreadByUserId(Long userId);
    
    @Query("SELECT COUNT(n) FROM UserNotification n WHERE n.userId = ?1 AND n.status = 'UNREAD'")
    long countUnreadByUserId(Long userId);
    
    @Query("SELECT n FROM UserNotification n WHERE n.status = 'UNREAD'")
    List<UserNotification> findUnreadNotifications();
    
    @Query("SELECT COUNT(n) FROM UserNotification n WHERE n.status = 'UNREAD'")
    long countUnreadNotifications();
} 