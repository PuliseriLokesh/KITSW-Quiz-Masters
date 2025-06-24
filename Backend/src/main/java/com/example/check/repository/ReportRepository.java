package com.example.check.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.check.model.Report;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    List<Report> findByStatusOrderByCreatedAtDesc(String status);
    
    List<Report> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Report> findByUsernameOrderByCreatedAtDesc(String username);
    
    @Query("SELECT r FROM Report r WHERE r.status = 'PENDING' ORDER BY r.createdAt DESC")
    List<Report> findPendingReports();
    
    @Query("SELECT COUNT(r) FROM Report r WHERE r.status = 'PENDING'")
    long countPendingReports();
    
    List<Report> findByIssueTypeOrderByCreatedAtDesc(String issueType);
    
    List<Report> findByPriorityOrderByCreatedAtDesc(String priority);
    
    List<Report> findAllByOrderByCreatedAtDesc();
} 