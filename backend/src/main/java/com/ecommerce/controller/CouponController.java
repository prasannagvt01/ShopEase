package com.ecommerce.controller;

import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CartService cartService;

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<com.ecommerce.dto.response.CartResponse>> applyCoupon(@RequestParam String code) {
        return ResponseEntity.ok(ApiResponse.success(cartService.applyCoupon(code)));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<ApiResponse<com.ecommerce.dto.response.CartResponse>> removeCoupon() {
        return ResponseEntity.ok(ApiResponse.success(cartService.removeCoupon()));
    }
}
