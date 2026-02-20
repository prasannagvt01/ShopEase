package com.ecommerce.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;

    private String firstName;
    private String lastName;

    @Indexed(unique = true)
    private String email;

    private String password;
    private String phone;

    @Builder.Default
    private java.util.List<Address> addresses = new java.util.ArrayList<>();

    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Builder.Default
    private Set<String> permissions = new HashSet<>();

    @Builder.Default
    private boolean active = true;

    private String profileImage;

    // Password Reset
    private String resetToken;
    private LocalDateTime resetTokenExpiry;

    // OTP Fields
    private String otp;
    private LocalDateTime otpExpiry;
    private int otpRequestCount;
    private LocalDateTime otpWindowStart;
    private LocalDateTime otpLockoutUntil;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Address {
        @Builder.Default
        private String id = java.util.UUID.randomUUID().toString();
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        private boolean isDefault;
    }

    public enum Role {
        USER, ADMIN, MANAGER, STAFF
    }
}
