package com.ecommerce.controller;

import com.ecommerce.dto.request.*;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        UserResponse response = userService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@RequestBody UpdateProfileRequest request) {
        UserResponse response = userService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PostMapping("/change-password-init")
    public ResponseEntity<ApiResponse<Void>> initiateChangePassword(
            @RequestBody java.util.Map<String, String> request) {
        String currentPassword = request.get("currentPassword");
        if (currentPassword == null || currentPassword.trim().isEmpty()) {
            throw new com.ecommerce.exception.BadRequestException("Current password is required");
        }
        userService.initiateChangePassword(currentPassword);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your email", null));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<UserResponse>> addAddress(@RequestBody AddressRequest request) {
        UserResponse response = userService.addAddress(request);
        return ResponseEntity.ok(ApiResponse.success("Address added successfully", response));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateAddress(@PathVariable String id,
            @RequestBody AddressRequest request) {
        UserResponse response = userService.updateAddress(id, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", response));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> deleteAddress(@PathVariable String id) {
        UserResponse response = userService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", response));
    }

    @PutMapping("/addresses/{id}/default")
    public ResponseEntity<ApiResponse<UserResponse>> setDefaultAddress(@PathVariable String id) {
        UserResponse response = userService.setDefaultAddress(id);
        return ResponseEntity.ok(ApiResponse.success("Default address updated successfully", response));
    }
}
