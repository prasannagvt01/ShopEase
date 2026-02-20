package com.ecommerce.config;

import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createOrUpdateAdminUser();
        createOrUpdateRegularUser();
    }

    private void createOrUpdateAdminUser() {
        Optional<User> existingAdmin = userRepository.findByEmail("admin@example.com");
        if (existingAdmin.isPresent()) {
            User admin = existingAdmin.get();
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRoles(Set.of(User.Role.ADMIN, User.Role.USER));
            admin.setActive(true);
            userRepository.save(admin);
            System.out.println("Default Admin User UPDATED: admin@example.com / admin123");
        } else {
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("User")
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("1234567890")
                    .roles(Set.of(User.Role.ADMIN, User.Role.USER))
                    .active(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Default Admin User CREATED: admin@example.com / admin123");
        }
    }

    private void createOrUpdateRegularUser() {
        Optional<User> existingUser = userRepository.findByEmail("user@example.com");
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setPassword(passwordEncoder.encode("user123"));
            user.setActive(true);
            userRepository.save(user);
            System.out.println("Default Regular User UPDATED: user@example.com / user123");
        } else {
            User user = User.builder()
                    .firstName("Regular")
                    .lastName("User")
                    .email("user@example.com")
                    .password(passwordEncoder.encode("user123"))
                    .phone("0987654321")
                    .roles(Set.of(User.Role.USER))
                    .active(true)
                    .build();
            userRepository.save(user);
            System.out.println("Default Regular User CREATED: user@example.com / user123");
        }
    }
}
