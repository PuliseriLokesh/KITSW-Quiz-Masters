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

import com.example.check.model.Contact;
import com.example.check.repository.ContactRepository;
import com.example.check.response_pojo.MessageResponse;
import com.example.check.service.AdminNotificationService;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private AdminNotificationService adminNotificationService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitContact(@RequestBody Map<String, Object> contactData) {
        try {
            Contact contact = new Contact();
            contact.setUsername((String) contactData.get("username"));
            contact.setEmail((String) contactData.get("email"));
            contact.setSubject((String) contactData.get("subject"));
            contact.setMessage((String) contactData.get("message"));
            
            if (contactData.get("userId") != null) {
                contact.setUserId(Long.valueOf(contactData.get("userId").toString()));
            }

            contactRepository.save(contact);
            
            // Create admin notification
            adminNotificationService.createNotification(
                "CONTACT_SUBMITTED",
                "New Contact Message",
                "A new contact message has been sent by " + contact.getUsername() + ": " + contact.getSubject(),
                contact.getId(),
                "CONTACT",
                contact.getUsername()
            );
            
            return ResponseEntity.ok(new MessageResponse("Message sent successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error sending message: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Contact>> getAllContacts() {
        List<Contact> contacts = contactRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Contact>> getPendingContacts() {
        List<Contact> contacts = contactRepository.findPendingContacts();
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Contact>> getUserContacts(@PathVariable Long userId) {
        List<Contact> contacts = contactRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(contacts);
    }

    @PutMapping("/{id}/respond")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> respondToContact(
            @PathVariable Long id,
            @RequestBody Map<String, String> responseData) {
        try {
            Optional<Contact> contactOpt = contactRepository.findById(id);
            if (contactOpt.isPresent()) {
                Contact contact = contactOpt.get();
                contact.setAdminResponse(responseData.get("response"));
                contact.setStatus("RESPONDED");
                contact.setRespondedAt(LocalDateTime.now());
                contact.setRespondedBy(responseData.get("adminUsername"));
                contact.setUpdatedAt(LocalDateTime.now());
                
                contactRepository.save(contact);
                return ResponseEntity.ok(new MessageResponse("Response sent successfully!"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error responding to contact: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateContactStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusData) {
        try {
            Optional<Contact> contactOpt = contactRepository.findById(id);
            if (contactOpt.isPresent()) {
                Contact contact = contactOpt.get();
                contact.setStatus(statusData.get("status"));
                contact.setUpdatedAt(LocalDateTime.now());
                
                contactRepository.save(contact);
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
    public ResponseEntity<?> deleteContact(@PathVariable Long id) {
        try {
            if (contactRepository.existsById(id)) {
                contactRepository.deleteById(id);
                return ResponseEntity.ok(new MessageResponse("Contact deleted successfully!"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error deleting contact: " + e.getMessage()));
        }
    }
} 