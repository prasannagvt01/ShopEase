package com.ecommerce.service;

import com.ecommerce.dto.request.UpdateProfileRequest;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final MailService mailService;

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    public UserResponse getCurrentUserProfile() {
        return UserResponse.fromUser(getCurrentUser());
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();

        if (hasValue(request.getFirstName())) {
            user.setFirstName(request.getFirstName());
        }
        if (hasValue(request.getLastName())) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (hasValue(request.getProfileImage())) {
            user.setProfileImage(request.getProfileImage());
        }

        // Update default address if exists, or add new one if none
        User.Address address = user.getAddresses().stream()
                .filter(User.Address::isDefault)
                .findFirst()
                .orElse(user.getAddresses().isEmpty() ? null : user.getAddresses().get(0));

        if (address == null) {
            address = new User.Address();
            address.setDefault(true);
            user.getAddresses().add(address);
        }

        if (request.getStreet() != null)
            address.setStreet(request.getStreet());
        if (request.getCity() != null)
            address.setCity(request.getCity());
        if (request.getState() != null)
            address.setState(request.getState());
        if (request.getZipCode() != null)
            address.setZipCode(request.getZipCode());
        if (request.getCountry() != null)
            address.setCountry(request.getCountry());

        user = userRepository.save(user);
        return UserResponse.fromUser(user);
    }

    @Transactional
    public void initiateChangePassword(String currentPassword) {
        User user = getCurrentUser();

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new com.ecommerce.exception.BadRequestException("Current password does not match");
        }

        // Check rate limit logic (similar to auth service or simplified for logged in
        // users)
        if (user.getOtpLockoutUntil() != null && user.getOtpLockoutUntil().isAfter(LocalDateTime.now())) {
            throw new com.ecommerce.exception.BadRequestException(
                    "Too many attempts. Please try again after " + user.getOtpLockoutUntil());
        }

        // Generate OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(2));
        userRepository.save(user);

        try {
            mailService.sendPasswordResetOtp(user.getEmail(), otp);
        } catch (Exception e) {
            throw new com.ecommerce.exception.BadRequestException("Failed to send OTP email");
        }
    }

    @Transactional
    public void changePassword(com.ecommerce.dto.request.ChangePasswordRequest request) {
        User user = getCurrentUser();

        // Check OTP
        if (request.getOtp() == null || !request.getOtp().equals(user.getOtp())) {
            throw new com.ecommerce.exception.BadRequestException("Invalid OTP");
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new com.ecommerce.exception.BadRequestException("OTP has expired");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new com.ecommerce.exception.BadRequestException("Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        // Clear OTP fields
        user.setOtp(null);
        user.setOtpExpiry(null);

        userRepository.save(user);

        mailService.sendPasswordChangedConfirmation(user.getEmail(), user.getFirstName() + " " + user.getLastName());
    }

    @Transactional
    public UserResponse addAddress(com.ecommerce.dto.request.AddressRequest request) {
        User user = getCurrentUser();

        User.Address address = User.Address.builder()
                .id(java.util.UUID.randomUUID().toString())
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .country(request.getCountry())
                .isDefault(request.isDefault() || user.getAddresses().isEmpty())
                .build();

        if (address.isDefault()) {
            user.getAddresses().forEach(a -> a.setDefault(false));
        }

        user.getAddresses().add(address);
        return UserResponse.fromUser(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateAddress(String addressId, com.ecommerce.dto.request.AddressRequest request) {
        User user = getCurrentUser();
        User.Address address = user.getAddresses().stream()
                .filter(a -> a.getId().equals(addressId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setZipCode(request.getZipCode());
        address.setCountry(request.getCountry());

        if (request.isDefault() && !address.isDefault()) {
            user.getAddresses().forEach(a -> a.setDefault(false));
            address.setDefault(true);
        }

        return UserResponse.fromUser(userRepository.save(user));
    }

    @Transactional
    public UserResponse deleteAddress(String addressId) {
        User user = getCurrentUser();
        boolean removed = user.getAddresses().removeIf(a -> a.getId().equals(addressId));

        if (!removed) {
            throw new ResourceNotFoundException("Address", "id", addressId);
        }

        // If we deleted the default address, set another one as default
        if (user.getAddresses().stream().noneMatch(User.Address::isDefault) && !user.getAddresses().isEmpty()) {
            user.getAddresses().get(0).setDefault(true);
        }

        return UserResponse.fromUser(userRepository.save(user));
    }

    @Transactional
    public UserResponse setDefaultAddress(String addressId) {
        User user = getCurrentUser();
        user.getAddresses().forEach(a -> a.setDefault(a.getId().equals(addressId)));

        if (user.getAddresses().stream().noneMatch(User.Address::isDefault)) {
            throw new ResourceNotFoundException("Address", "id", addressId);
        }

        return UserResponse.fromUser(userRepository.save(user));
    }

    private boolean hasValue(String value) {
        return value != null && !value.trim().isEmpty();
    }

    // Admin methods
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserResponse::fromUser);
    }

    public UserResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return UserResponse.fromUser(user);
    }

    public void toggleUserStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    public UserResponse updateUserRole(String userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.getRoles().clear();
        user.getRoles().add(User.Role.valueOf(role.toUpperCase()));

        // Ensure USER role is always present
        if (!user.getRoles().contains(User.Role.USER)) {
            user.getRoles().add(User.Role.USER);
        }

        user = userRepository.save(user);
        return UserResponse.fromUser(user);
    }

    public void activateUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setActive(true);
        userRepository.save(user);
    }

    public void deactivateUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional
    public UserResponse updateUserAdmin(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (hasValue(request.getFirstName()))
            user.setFirstName(request.getFirstName());
        if (hasValue(request.getLastName()))
            user.setLastName(request.getLastName());
        if (request.getPhone() != null)
            user.setPhone(request.getPhone());

        // Update default address if exists, or first
        User.Address existingAddr = user.getAddresses().stream()
                .filter(User.Address::isDefault)
                .findFirst()
                .orElse(user.getAddresses().isEmpty() ? null : user.getAddresses().get(0));

        if (existingAddr == null) {
            existingAddr = new User.Address();
            existingAddr.setDefault(true);
            user.getAddresses().add(existingAddr);
        }

        if (request.getStreet() != null)
            existingAddr.setStreet(request.getStreet());
        if (request.getCity() != null)
            existingAddr.setCity(request.getCity());
        if (request.getState() != null)
            existingAddr.setState(request.getState());
        if (request.getZipCode() != null)
            existingAddr.setZipCode(request.getZipCode());
        if (request.getCountry() != null)
            existingAddr.setCountry(request.getCountry());

        user = userRepository.save(user);
        return UserResponse.fromUser(user);
    }
}
