package com.ecommerce.controller;

import com.ecommerce.dto.request.OrderRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.PdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final PdfService pdfService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse order = orderService.createOrder(request);
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully", order));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<OrderResponse> orders = orderService.getUserOrders(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable String id) {
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable String id) {
        OrderResponse order = orderService.cancelOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> generateInvoice(@PathVariable String id) {
        // Ensure user has access (handled by getOrderEntity internal checks or we
        // should do it here)
        // orderService.getOrderById(id) does access check.
        // But getOrderEntity might not?
        // Let's use getOrderById first to verify access, then get entity.
        orderService.getOrderById(id);
        com.ecommerce.model.Order order = orderService.getOrderEntity(id);

        byte[] pdfBytes = pdfService.generateInvoice(order);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=invoice_" + id + ".pdf")
                .body(pdfBytes);
    }
}
