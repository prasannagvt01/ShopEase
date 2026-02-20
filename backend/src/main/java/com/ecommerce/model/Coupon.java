package com.ecommerce.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "coupons")
public class Coupon {
    @Id
    private String id;

    @Indexed(unique = true)
    private String code;

    private DiscountType discountType;
    private BigDecimal discountValue;

    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;

    private LocalDateTime startDate;
    private LocalDateTime expiryDate;

    private Integer usageLimit;

    @Builder.Default
    private Integer usedCount = 0;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private Set<String> applicableCategoryIds = new HashSet<>();

    @Builder.Default
    private Set<String> applicableProductIds = new HashSet<>();

    public enum DiscountType {
        PERCENTAGE,
        FIXED_AMOUNT
    }
}
