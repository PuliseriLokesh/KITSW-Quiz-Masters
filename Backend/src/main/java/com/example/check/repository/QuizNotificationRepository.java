package com.example.check.repository;

import com.example.check.model.QuizNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QuizNotificationRepository extends JpaRepository<QuizNotification, Long> {
    
    List<QuizNotification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<QuizNotification> findByUsernameOrderByCreatedAtDesc(String username);
    
    List<QuizNotification> findByStatusOrderByCreatedAtDesc(String status);
    
    @Query("SELECT qn FROM QuizNotification qn WHERE qn.userId = ?1 AND qn.status = 'UNREAD' ORDER BY qn.createdAt DESC")
    List<QuizNotification> findUnreadNotificationsByUserId(Long userId);
    
    @Query("SELECT qn FROM QuizNotification qn WHERE qn.username = ?1 AND qn.status = 'UNREAD' ORDER BY qn.createdAt DESC")
    List<QuizNotification> findUnreadNotificationsByUsername(String username);
    
    @Query("SELECT COUNT(qn) FROM QuizNotification qn WHERE qn.userId = ?1 AND qn.status = 'UNREAD'")
    long countUnreadNotificationsByUserId(Long userId);
    
    @Query("SELECT COUNT(qn) FROM QuizNotification qn WHERE qn.username = ?1 AND qn.status = 'UNREAD'")
    long countUnreadNotificationsByUsername(String username);
    
    List<QuizNotification> findByQuizIdOrderByCreatedAtDesc(Long quizId);
    
    @Query("SELECT qn FROM QuizNotification qn WHERE qn.quizStartTime BETWEEN ?1 AND ?2")
    List<QuizNotification> findNotificationsByQuizStartTimeRange(LocalDateTime start, LocalDateTime end);
} 