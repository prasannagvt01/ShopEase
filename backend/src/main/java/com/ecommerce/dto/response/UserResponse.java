package com.ecommerce.dto.response;

import com.ecommerce.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private AddressDto address;
    private Set<String> roles;
    private String role; // Primary role for admin display
    private String profileImage;
    private java.util.List<AddressDto> addresses;
    private boolean active;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDto {
        private String id;
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        private boolean isDefault;
    }

    public static UserResponse fromUser(User user) {
        java.util.List<AddressDto> addressDtos = user.getAddresses().stream()
                .map(address -> AddressDto.builder()
                        .id(address.getId())
                        .street(address.getStreet())
                        .city(address.getCity())
                        .state(address.getState())
                        .zipCode(address.getZipCode())
                        .country(address.getCountry())
                        .isDefault(address.isDefault())
                        .build())
                .collect(java.util.stream.Collectors.toList());

        Set<String> roleNames = user.getRoles().stream().map(Enum::name).collect(Collectors.toSet());
        String primaryRole = roleNames.contains("ADMIN") ? "ADMIN" : "USER";

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .addresses(addressDtos)
                .roles(roleNames)
                .role(primaryRole)
                .profileImage(user.getProfileImage())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
