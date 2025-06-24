package com.example.check.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.check.model.AdminNotification;

@Repository
public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {
    
    List<AdminNotification> findByStatusOrderByCreatedAtDesc(String status);
    
    @Query("SELECT an FROM AdminNotification an WHERE an.status = 'UNREAD' ORDER BY an.createdAt DESC")
    List<AdminNotification> findUnreadNotifications();
    
    @Query("SELECT COUNT(an) FROM AdminNotification an WHERE an.status = 'UNREAD'")
    long countUnreadNotifications();
    
    List<AdminNotification> findByTypeOrderByCreatedAtDesc(String type);
    
    List<AdminNotification> findByRelatedTypeAndRelatedIdOrderByCreatedAtDesc(String relatedType, Long relatedId);
    
    List<AdminNotification> findAllByOrderByCreatedAtDesc();
} 