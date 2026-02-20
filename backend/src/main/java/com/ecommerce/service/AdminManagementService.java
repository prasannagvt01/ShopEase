package com.ecommerce.service;

import com.ecommerce.model.AdminActivityLog;
import com.ecommerce.model.User;
import com.ecommerce.repository.AdminActivityLogRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdminManagementService {

    private final UserRepository userRepository;
    private final AdminActivityLogRepository activityLogRepository;

    public void logActivity(String action, String entityType, String entityId, String description,
            Map<String, Object> details) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : "SYSTEM";

        User admin = userRepository.findByEmail(email).orElse(null);

        AdminActivityLog log = AdminActivityLog.builder()
                .adminId(admin != null ? admin.getId() : "SYSTEM")
                .adminName(admin != null ? admin.getFirstName() + " " + admin.getLastName() : "SYSTEM")
                .adminEmail(email)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();

        activityLogRepository.save(log);
    }

    public List<User> getAllAdmins() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().contains(User.Role.ADMIN) ||
                        u.getRoles().contains(User.Role.MANAGER) ||
                        u.getRoles().contains(User.Role.STAFF))
                .toList();
    }

    public User updateAdminPermissions(String adminId, Set<String> permissions) {
        User user = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        user.setPermissions(permissions);
        return userRepository.save(user);
    }

    public List<AdminActivityLog> getAllLogs() {
        return activityLogRepository.findAll();
    }
}
