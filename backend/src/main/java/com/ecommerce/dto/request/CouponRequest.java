package com.ecommerce.dto.request;

import com.ecommerce.model.Coupon;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class CouponRequest {
    @NotBlank(message = "Code is required")
    private String code;

    @NotNull(message = "Discount type is required")
    private Coupon.DiscountType discountType;

    @NotNull(message = "Discount value is required")
    private BigDecimal discountValue;

    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;

    private LocalDateTime startDate;
    private LocalDateTime expiryDate;

    private Integer usageLimit;
    private boolean active = true;

    private Set<String> applicableCategoryIds;
    private Set<String> applicableProductIds;
}
