package com.ecommerce.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "complaints")
public class Complaint {
    @Id
    private String id;

    private String userId;
    private String userName;
    private String userEmail;

    private String orderId; // Optional link to an order
    private String subject;
    private String description;

    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.PENDING;

    @Builder.Default
    private ComplaintPriority priority = ComplaintPriority.MEDIUM;

    private String adminNotes;
    private String resolution;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum ComplaintStatus {
        PENDING, IN_PROGRESS, RESOLVED, CLOSED
    }

    public enum ComplaintPriority {
        LOW, MEDIUM, HIGH, URGENT
    }
}
