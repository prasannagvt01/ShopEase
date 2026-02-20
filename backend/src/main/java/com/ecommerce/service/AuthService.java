package com.ecommerce.service;

import com.ecommerce.dto.request.*;
import com.ecommerce.dto.response.AuthResponse;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final MailService mailService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .roles(Set.of(User.Role.USER))
                .active(true)
                .build();

        user = userRepository.save(user);

        try {
            mailService.sendWelcomeEmail(user.getEmail(), user.getFirstName() + " " + user.getLastName());
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }

        String token = jwtTokenProvider.generateToken(user.getEmail());
        return AuthResponse.of(token, UserResponse.fromUser(user));
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        try {
            mailService.sendLoginAlertEmail(user.getEmail(), user.getFirstName() + " " + user.getLastName(),
                    "Web Browser",
                    "Unknown Location");
        } catch (Exception e) {
            // Log error but don't fail login
            System.err.println("Failed to send login alert email: " + e.getMessage());
        }

        String token = jwtTokenProvider.generateToken(authentication);
        return AuthResponse.of(token, UserResponse.fromUser(user));
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found with this email"));

        // Check lockout
        if (user.getOtpLockoutUntil() != null && user.getOtpLockoutUntil().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Too many attempts. Please try again after " + user.getOtpLockoutUntil());
        }

        // Check window reset (6 hours)
        if (user.getOtpWindowStart() == null ||
                user.getOtpWindowStart().isBefore(LocalDateTime.now().minusHours(6))) {
            user.setOtpWindowStart(LocalDateTime.now());
            user.setOtpRequestCount(0);
        }

        // Check limit (5 attempts)
        if (user.getOtpRequestCount() >= 5) {
            user.setOtpLockoutUntil(LocalDateTime.now().plusHours(6));
            userRepository.save(user); // Save lockout state
            throw new BadRequestException("Too many OTP requests. Please try again in 6 hours.");
        }

        // Generate OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(2));
        user.setOtpRequestCount(user.getOtpRequestCount() + 1);

        // Clear old reset token if any
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);

        try {
            mailService.sendPasswordResetOtp(email, otp);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
            throw new BadRequestException("Failed to send email");
        }
    }

    public String verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new BadRequestException("Invalid OTP");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired");
        }

        // Generate reset token for password change
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));

        // Clear OTP
        user.setOtp(null);
        user.setOtpExpiry(null);

        userRepository.save(user);
        return resetToken;
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        try {
            mailService.sendPasswordChangedConfirmation(user.getEmail(),
                    user.getFirstName() + " " + user.getLastName());
        } catch (Exception e) {
            System.err.println("Failed to send password changed email: " + e.getMessage());
        }
    }

}
