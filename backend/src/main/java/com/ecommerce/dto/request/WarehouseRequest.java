package com.ecommerce.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class WarehouseRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String address;
    private String city;
    private String state;
    private String contactNumber;
    private boolean active = true;
}
