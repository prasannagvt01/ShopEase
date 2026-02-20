package com.ecommerce.controller;

import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.model.Order;
import com.ecommerce.model.Payment;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.PaymentService;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;

    @PostMapping("/razorpay/order/{orderId}")
    public ResponseEntity<ApiResponse<Payment>> createRazorpayOrder(@PathVariable String orderId)
            throws RazorpayException {
        Order order = orderService.getOrderEntity(orderId);
        Payment payment = paymentService.createRazorpayOrder(order);
        return ResponseEntity.ok(ApiResponse.success("Razorpay order created", payment));
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<ApiResponse<String>> verifyPayment(@RequestBody Map<String, String> data) {
        String razorpayOrderId = data.get("razorpay_order_id");
        String razorpayPaymentId = data.get("razorpay_payment_id");
        String razorpaySignature = data.get("razorpay_signature");
        String paymentId = data.get("payment_id");

        boolean isValid = paymentService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

        if (isValid) {
            paymentService.completePayment(paymentId, razorpayPaymentId, "UPI"); // Razorpay method can be dynamic, but
                                                                                 // UPI is placeholder
            return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", "success"));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Payment verification failed"));
        }
    }
}
