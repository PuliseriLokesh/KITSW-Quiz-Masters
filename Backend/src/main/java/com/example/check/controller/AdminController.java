package com.example.check.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.check.model.Contact;
import com.example.check.model.Report;
import com.example.check.repository.ContactRepository;
import com.example.check.repository.ReportRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ContactRepository contactRepository;

    @GetMapping("/notifications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getNotifications() {
        List<Map<String, Object>> notifications = new ArrayList<>();

        // Get pending reports
        List<Report> pendingReports = reportRepository.findPendingReports();
        for (Report report : pendingReports) {
            Map<String, Object> notification = new HashMap<>();
            notification.put("id", report.getId());
            notification.put("type", "REPORT");
            notification.put("title", "New Report: " + report.getSubject());
            notification.put("message", report.getDescription().substring(0, Math.min(100, report.getDescription().length())) + "...");
            notification.put("status", report.getStatus());
            notification.put("priority", report.getPriority());
            notification.put("createdAt", report.getCreatedAt());
            notification.put("username", report.getUsername());
            notifications.add(notification);
        }

        // Get pending contacts
        List<Contact> pendingContacts = contactRepository.findPendingContacts();
        for (Contact contact : pendingContacts) {
            Map<String, Object> notification = new HashMap<>();
            notification.put("id", contact.getId());
            notification.put("type", "CONTACT");
            notification.put("title", "New Contact: " + contact.getSubject());
            notification.put("message", contact.getMessage().substring(0, Math.min(100, contact.getMessage().length())) + "...");
            notification.put("status", contact.getStatus());
            notification.put("createdAt", contact.getCreatedAt());
            notification.put("username", contact.getUsername());
            notification.put("email", contact.getEmail());
            notifications.add(notification);
        }

        // Sort by creation date (newest first)
        notifications.sort((a, b) -> {
            String dateA = a.get("createdAt").toString();
            String dateB = b.get("createdAt").toString();
            return dateB.compareTo(dateA);
        });

        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/dashboard-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("pendingReports", reportRepository.countPendingReports());
        stats.put("pendingContacts", contactRepository.countPendingContacts());
        stats.put("totalReports", reportRepository.count());
        stats.put("totalContacts", contactRepository.count());
        
        return ResponseEntity.ok(stats);
    }
} 