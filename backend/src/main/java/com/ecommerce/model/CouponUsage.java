package com.ecommerce.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "coupon_usage")
public class CouponUsage {
    @Id
    private String id;
    private String couponId;
    private String userId;
    private String orderId;
    private LocalDateTime usedAt;
}
