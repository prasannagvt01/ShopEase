package com.ecommerce.service;

import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.Coupon;
import com.ecommerce.model.CouponUsage;
import com.ecommerce.model.User;
import com.ecommerce.repository.CouponRepository;
import com.ecommerce.repository.CouponUsageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final UserService userService;

    public Coupon validateCoupon(String code, BigDecimal orderAmount, List<String> productIds,
            List<String> categoryIds) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "code", code));

        if (!coupon.isActive()) {
            throw new BadRequestException("Coupon is inactive");
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new BadRequestException("Coupon is not yet valid");
        }
        if (coupon.getExpiryDate() != null && now.isAfter(coupon.getExpiryDate())) {
            throw new BadRequestException("Coupon has expired");
        }

        if (coupon.getMinOrderAmount() != null && orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Minimum order amount of ₹" + coupon.getMinOrderAmount() + " required");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit reached");
        }

        User user = userService.getCurrentUser();
        if (couponUsageRepository.existsByCouponIdAndUserId(coupon.getId(), user.getId())) {
            throw new BadRequestException("You have already used this coupon");
        }

        // Check product/category applicability if specified
        if (!coupon.getApplicableProductIds().isEmpty()) {
            boolean matches = productIds.stream().anyMatch(pid -> coupon.getApplicableProductIds().contains(pid));
            if (!matches) {
                throw new BadRequestException("Coupon is not applicable to any products in your cart");
            }
        }

        if (!coupon.getApplicableCategoryIds().isEmpty()) {
            boolean matches = categoryIds.stream().anyMatch(cid -> coupon.getApplicableCategoryIds().contains(cid));
            if (!matches) {
                throw new BadRequestException("Coupon is not applicable to items in these categories");
            }
        }

        return coupon;
    }

    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderAmount) {
        BigDecimal discount = BigDecimal.ZERO;
        if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            discount = orderAmount.multiply(coupon.getDiscountValue()).divide(new BigDecimal("100"), 2,
                    RoundingMode.HALF_UP);
        } else {
            discount = coupon.getDiscountValue();
        }

        if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
            discount = coupon.getMaxDiscountAmount();
        }

        return discount.min(orderAmount);
    }

    @Transactional
    public void recordCouponUsage(String couponId, String userId, String orderId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", couponId));

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        CouponUsage usage = CouponUsage.builder()
                .couponId(couponId)
                .userId(userId)
                .orderId(orderId)
                .usedAt(LocalDateTime.now())
                .build();
        couponUsageRepository.save(usage);
    }
}
