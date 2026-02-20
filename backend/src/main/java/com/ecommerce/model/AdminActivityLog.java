package com.ecommerce.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "admin_activity_logs")
public class AdminActivityLog {
    @Id
    private String id;

    private String adminId;
    private String adminName;
    private String adminEmail;

    private String action; // e.g., "CREATE_PRODUCT", "UPDATE_ORDER_STATUS", "DELETE_COUPON"
    private String entityType; // e.g., "PRODUCT", "ORDER", "COUPON"
    private String entityId;

    private String description;
    private Map<String, Object> details; // Optional extra details (e.g., status changed from X to Y)

    private String ipAddress;

    @CreatedDate
    private LocalDateTime timestamp;
}
