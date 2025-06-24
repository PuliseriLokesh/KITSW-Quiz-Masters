package com.example.check.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.check.model.AdminNotification;
import com.example.check.model.Contact;
import com.example.check.model.Report;
import com.example.check.repository.AdminNotificationRepository;
import com.example.check.repository.ContactRepository;
import com.example.check.repository.ReportRepository;
import com.example.check.service.AdminNotificationService;
import com.example.check.service.UserNotificationService;

@Service
public class AdminNotificationServiceImpl implements AdminNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(AdminNotificationServiceImpl.class);

    @Autowired
    private AdminNotificationRepository adminNotificationRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private UserNotificationService userNotificationService;

    @Override
    @Transactional
    public void createNotification(String type, String title, String message, Long relatedId, String relatedType, String senderName) {
        AdminNotification notification = new AdminNotification(type, title, message, relatedId, relatedType);
        notification.setSenderName(senderName);
        adminNotificationRepository.save(notification);
    }

    @Override
    public List<AdminNotification> getAllNotifications() {
        return adminNotificationRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public List<AdminNotification> getUnreadNotifications() {
        return adminNotificationRepository.findUnreadNotifications();
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Optional<AdminNotification> notificationOpt = adminNotificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            AdminNotification notification = notificationOpt.get();
            notification.setStatus("READ");
            notification.setReadAt(LocalDateTime.now());
            adminNotificationRepository.save(notification);
        }
    }

    @Override
    @Transactional
    public void replyToNotification(Long notificationId, String reply) {
        logger.info("Starting replyToNotification for notificationId: {}", notificationId);
        
        Optional<AdminNotification> notificationOpt = adminNotificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            AdminNotification notification = notificationOpt.get();
            logger.info("Found notification: type={}, relatedId={}, relatedType={}", 
                       notification.getType(), notification.getRelatedId(), notification.getRelatedType());
            
            // Save reply to the actual entity (Report or Contact)
            if ("REPORT_SUBMITTED".equals(notification.getType()) && notification.getRelatedId() != null) {
                logger.info("Processing REPORT_SUBMITTED notification");
                Optional<Report> reportOpt = reportRepository.findById(notification.getRelatedId());
                if (reportOpt.isPresent()) {
                    Report report = reportOpt.get();
                    logger.info("Found report: userId={}, subject={}", report.getUserId(), report.getSubject());
                    report.setAdminResponse(reply);
                    report.setRespondedAt(LocalDateTime.now());
                    report.setRespondedBy("Admin"); // You can get the actual admin username from security context
                    report.setStatus("RESPONDED");
                    reportRepository.save(report);
                    
                    // Create user notification
                    if (report.getUserId() != null) {
                        logger.info("Creating user notification for userId: {}", report.getUserId());
                        userNotificationService.createNotification(
                            report.getUserId(),
                            "REPORT_REPLY",
                            "Admin Response to Your Report",
                            "Admin has responded to your report: " + report.getSubject(),
                            report.getId(),
                            "REPORT"
                        );
                        logger.info("User notification created successfully");
                    } else {
                        logger.warn("Report userId is null, cannot create user notification");
                    }
                } else {
                    logger.warn("Report not found for id: {}", notification.getRelatedId());
                }
            } else if ("CONTACT_SUBMITTED".equals(notification.getType()) && notification.getRelatedId() != null) {
                logger.info("Processing CONTACT_SUBMITTED notification");
                Optional<Contact> contactOpt = contactRepository.findById(notification.getRelatedId());
                if (contactOpt.isPresent()) {
                    Contact contact = contactOpt.get();
                    logger.info("Found contact: userId={}, subject={}", contact.getUserId(), contact.getSubject());
                    contact.setAdminResponse(reply);
                    contact.setRespondedAt(LocalDateTime.now());
                    contact.setRespondedBy("Admin"); // You can get the actual admin username from security context
                    contact.setStatus("RESPONDED");
                    contactRepository.save(contact);
                    
                    // Create user notification
                    if (contact.getUserId() != null) {
                        logger.info("Creating user notification for userId: {}", contact.getUserId());
                        userNotificationService.createNotification(
                            contact.getUserId(),
                            "CONTACT_REPLY",
                            "Admin Response to Your Message",
                            "Admin has responded to your message: " + contact.getSubject(),
                            contact.getId(),
                            "CONTACT"
                        );
                        logger.info("User notification created successfully");
                    } else {
                        logger.warn("Contact userId is null, cannot create user notification");
                    }
                } else {
                    logger.warn("Contact not found for id: {}", notification.getRelatedId());
                }
            } else {
                logger.warn("Notification type not matched: type={}, relatedId={}", 
                           notification.getType(), notification.getRelatedId());
            }
            
            // Update the notification
            notification.setReply(reply);
            notification.setStatus("REPLIED");
            notification.setRepliedAt(LocalDateTime.now());
            adminNotificationRepository.save(notification);
            logger.info("Admin notification updated successfully");
        } else {
            logger.warn("Admin notification not found for id: {}", notificationId);
        }
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        List<AdminNotification> unreadNotifications = getUnreadNotifications();
        for (AdminNotification notification : unreadNotifications) {
            notification.setStatus("READ");
            notification.setReadAt(LocalDateTime.now());
            adminNotificationRepository.save(notification);
        }
    }

    @Override
    public long getUnreadCount() {
        return adminNotificationRepository.countUnreadNotifications();
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        adminNotificationRepository.deleteById(notificationId);
    }
} 