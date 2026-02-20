package com.ecommerce.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "warehouses")
public class Warehouse {
    @Id
    private String id;
    private String name;
    private String address;
    private String city;
    private String state;
    private String contactNumber;

    @Builder.Default
    private boolean active = true;
}
