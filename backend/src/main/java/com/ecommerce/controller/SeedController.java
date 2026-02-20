package com.ecommerce.controller;

import com.ecommerce.model.Category;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.model.User.Role;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/seed")
@RequiredArgsConstructor
public class SeedController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping
    public ResponseEntity<String> seedData() {
        // 1. Seed Categories
        if (categoryRepository.count() == 0) {
            Category electronics = new Category();
            electronics.setName("Electronics");
            electronics.setDescription("Gadgets and devices");
            electronics.setSlug("electronics");
            categoryRepository.save(electronics);

            Category clothing = new Category();
            clothing.setName("Clothing");
            clothing.setDescription("Apparel and fashion");
            clothing.setSlug("clothing");
            categoryRepository.save(clothing);
        }

        // 2. Seed Admin User
        if (!userRepository.existsByEmail("admin@example.com")) {
            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRoles(java.util.Collections.singleton(Role.ADMIN));
            userRepository.save(admin);
        }

        // 3. Seed Products
        if (productRepository.count() == 0) {
            Category electronics = categoryRepository.findByName("Electronics").orElse(null);
            if (electronics != null) {
                Product laptop = new Product();
                laptop.setName("High-Performance Laptop");
                laptop.setDescription("A powerful laptop for developers.");
                laptop.setPrice(new BigDecimal("1200.00"));
                laptop.setStockQuantity(10);
                laptop.setCategoryId(electronics.getId());
                laptop.setCategoryName(electronics.getName());
                laptop.setImages(List.of("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800"));
                productRepository.save(laptop);
            }
        }

        return ResponseEntity.ok("Data seeded successfully!");
    }
}
