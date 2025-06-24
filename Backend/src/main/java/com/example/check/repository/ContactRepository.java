package com.example.check.repository;

import com.example.check.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    
    List<Contact> findByStatusOrderByCreatedAtDesc(String status);
    
    List<Contact> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Contact> findByEmailOrderByCreatedAtDesc(String email);
    
    @Query("SELECT c FROM Contact c WHERE c.status = 'PENDING' ORDER BY c.createdAt DESC")
    List<Contact> findPendingContacts();
    
    @Query("SELECT COUNT(c) FROM Contact c WHERE c.status = 'PENDING'")
    long countPendingContacts();
    
    List<Contact> findAllByOrderByCreatedAtDesc();
} 