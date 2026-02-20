package com.ecommerce.repository;

import com.ecommerce.model.Coupon;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CouponRepository extends MongoRepository<Coupon, String> {
    Optional<Coupon> findByCode(String code);
}
