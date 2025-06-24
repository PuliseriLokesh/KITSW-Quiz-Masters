package com.example.check.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "quiz_notifications")
public class QuizNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @Column(name = "quiz_title", nullable = false)
    private String quizTitle;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username")
    private String username;

    @Column(nullable = false)
    private String type = "SCHEDULED_QUIZ"; // SCHEDULED_QUIZ, QUIZ_STARTING, QUIZ_ENDING

    @Column(nullable = false)
    private String status = "UNREAD"; // UNREAD, READ

    @Column(name = "notification_time", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime notificationTime;

    @Column(name = "quiz_start_time")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime quizStartTime;

    @Column(name = "quiz_end_time")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime quizEndTime;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "created_at", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    // Constructors
    public QuizNotification() {
        this.createdAt = LocalDateTime.now();
    }

    public QuizNotification(Long quizId, String quizTitle, Long userId, String username, 
                           LocalDateTime quizStartTime, LocalDateTime quizEndTime) {
        this();
        this.quizId = quizId;
        this.quizTitle = quizTitle;
        this.userId = userId;
        this.username = username;
        this.quizStartTime = quizStartTime;
        this.quizEndTime = quizEndTime;
        this.notificationTime = LocalDateTime.now();
        this.message = "New quiz '" + quizTitle + "' is now available!";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getNotificationTime() {
        return notificationTime;
    }

    public void setNotificationTime(LocalDateTime notificationTime) {
        this.notificationTime = notificationTime;
    }

    public LocalDateTime getQuizStartTime() {
        return quizStartTime;
    }

    public void setQuizStartTime(LocalDateTime quizStartTime) {
        this.quizStartTime = quizStartTime;
    }

    public LocalDateTime getQuizEndTime() {
        return quizEndTime;
    }

    public void setQuizEndTime(LocalDateTime quizEndTime) {
        this.quizEndTime = quizEndTime;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 