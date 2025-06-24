package com.example.check.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.check.model.Report;
import com.example.check.repository.ReportRepository;
import com.example.check.response_pojo.MessageResponse;
import com.example.check.service.AdminNotificationService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private AdminNotificationService adminNotificationService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitReport(@RequestBody Map<String, Object> reportData) {
        try {
            Report report = new Report();
            report.setIssueType((String) reportData.get("issueType"));
            report.setSubject((String) reportData.get("subject"));
            report.setDescription((String) reportData.get("description"));
            report.setPriority((String) reportData.get("priority"));
            report.setUsername((String) reportData.get("username"));
            
            if (reportData.get("userId") != null) {
                report.setUserId(Long.valueOf(reportData.get("userId").toString()));
            }

            reportRepository.save(report);
            
            // Create admin notification
            adminNotificationService.createNotification(
                "REPORT_SUBMITTED",
                "New Report Submitted",
                "A new report has been submitted by " + report.getUsername() + ": " + report.getSubject(),
                report.getId(),
                "REPORT",
                report.getUsername()
            );
            
            return ResponseEntity.ok(new MessageResponse("Report submitted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error submitting report: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Report>> getAllReports() {
        List<Report> reports = reportRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Report>> getPendingReports() {
        List<Report> reports = reportRepository.findPendingReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Report>> getUserReports(@PathVariable Long userId) {
        List<Report> reports = reportRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(reports);
    }

    @PutMapping("/{id}/respond")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> respondToReport(
            @PathVariable Long id,
            @RequestBody Map<String, String> responseData) {
        try {
            Optional<Report> reportOpt = reportRepository.findById(id);
            if (reportOpt.isPresent()) {
                Report report = reportOpt.get();
                report.setAdminResponse(responseData.get("response"));
                report.setStatus("RESPONDED");
                report.setRespondedAt(LocalDateTime.now());
                report.setRespondedBy(responseData.get("adminUsername"));
                report.setUpdatedAt(LocalDateTime.now());
                
                reportRepository.save(report);
                return ResponseEntity.ok(new MessageResponse("Response sent successfully!"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error responding to report: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateReportStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusData) {
        try {
            Optional<Report> reportOpt = reportRepository.findById(id);
            if (reportOpt.isPresent()) {
                Report report = reportOpt.get();
                report.setStatus(statusData.get("status"));
                report.setUpdatedAt(LocalDateTime.now());
                
                reportRepository.save(report);
                return ResponseEntity.ok(new MessageResponse("Status updated successfully!"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error updating status: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteReport(@PathVariable Long id) {
        try {
            if (reportRepository.existsById(id)) {
                reportRepository.deleteById(id);
                return ResponseEntity.ok(new MessageResponse("Report deleted successfully!"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error deleting report: " + e.getMessage()));
        }
    }
} 