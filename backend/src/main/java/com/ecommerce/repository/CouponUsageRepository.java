package com.ecommerce.repository;

import com.ecommerce.model.CouponUsage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponUsageRepository extends MongoRepository<CouponUsage, String> {
    long countByCouponId(String couponId);

    boolean existsByCouponIdAndUserId(String couponId, String userId);
}
