package com.ecommerce.controller;

import com.ecommerce.dto.request.CategoryRequest;
import com.ecommerce.dto.request.CouponRequest;
import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.request.WarehouseRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.CategoryResponse;
import com.ecommerce.dto.response.DashboardStatsResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.model.Coupon;
import com.ecommerce.model.Order;
import com.ecommerce.model.Warehouse;
import com.ecommerce.service.CategoryService;
import com.ecommerce.service.ComplaintService;
import com.ecommerce.service.DashboardService;
import com.ecommerce.service.InventoryService;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.PaymentService;
import com.ecommerce.service.ProductService;
import com.ecommerce.service.UserService;
import com.ecommerce.service.WarehouseService;
import com.ecommerce.service.ReportService;
import com.ecommerce.service.AdminManagementService;
import com.ecommerce.repository.CouponRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final OrderService orderService;
    private final UserService userService;
    private final DashboardService dashboardService;
    private final ComplaintService complaintService;
    private final PaymentService paymentService;
    private final InventoryService inventoryService;
    private final CouponRepository couponRepository;
    private final WarehouseService warehouseService;
    private final ReportService reportService;
    private final AdminManagementService adminManagementService;

    // ========== Dashboard ==========

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ========== Product Management ==========

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ProductResponse> products = productService.getAllProductsAdmin(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.success("Product created successfully", product));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable String id,
            @RequestBody ProductRequest request) {
        ProductResponse product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    @PostMapping("/products/bulk-upload")
    public ResponseEntity<ApiResponse<Void>> bulkUploadProducts(@RequestParam("file") MultipartFile file) {
        productService.saveProductsFromCsv(file);
        return ResponseEntity.ok(ApiResponse.success("Products uploaded successfully", null));
    }

    // ========== Category Management ==========

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse category = categoryService.createCategory(request);
        return ResponseEntity.ok(ApiResponse.success("Category created successfully", category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable String id,
            @RequestBody CategoryRequest request) {
        CategoryResponse category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }

    // ========== Order Management ==========

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<OrderResponse> orders = orderService.getAllOrders(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable String id) {
        OrderResponse order = orderService.getOrderByIdAdmin(id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @GetMapping("/orders/status/{status}")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getOrdersByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        Page<OrderResponse> orders = orderService.getOrdersByStatus(orderStatus,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable String id,
            @RequestParam String status) {
        OrderResponse order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", order));
    }

    @PutMapping("/orders/{id}/tracking")
    public ResponseEntity<ApiResponse<OrderResponse>> updateTrackingNumber(
            @PathVariable String id,
            @RequestParam String trackingNumber) {
        OrderResponse order = orderService.updateTrackingNumber(id, trackingNumber);
        return ResponseEntity.ok(ApiResponse.success("Tracking number updated", order));
    }

    // ========== User Management ==========

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<UserResponse> users = userService.getAllUsers(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable String id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable String id,
            @RequestBody com.ecommerce.dto.request.UpdateProfileRequest request) {
        UserResponse user = userService.updateUserAdmin(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable String id) {
        userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("User status updated", null));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable String id,
            @RequestParam String role) {
        UserResponse user = userService.updateUserRole(id, role);
        return ResponseEntity.ok(ApiResponse.success("User role updated", user));
    }

    @PutMapping("/users/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable String id) {
        userService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User activated", null));
    }

    @PutMapping("/users/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable String id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deactivated", null));
    }

    @GetMapping("/users/{id}/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getUserOrderHistory(@PathVariable String id) {
        List<OrderResponse> orders = orderService.getOrdersByUserId(id);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    // ========== Complaint Management ==========

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<Page<com.ecommerce.model.Complaint>>> getAllComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<com.ecommerce.model.Complaint> complaints = complaintService.getAllComplaints(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ApiResponse<com.ecommerce.model.Complaint>> updateComplaintStatus(
            @PathVariable String id,
            @RequestParam com.ecommerce.model.Complaint.ComplaintStatus status,
            @RequestParam(required = false) String notes) {
        com.ecommerce.model.Complaint complaint = complaintService.updateComplaintStatus(id, status, notes);
        return ResponseEntity.ok(ApiResponse.success("Complaint status updated", complaint));
    }

    // ========== Payment Management ==========

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<Page<com.ecommerce.model.Payment>>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<com.ecommerce.model.Payment> payments = paymentService.getAllPayments(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    // ========== Warehouse Management ==========

    @GetMapping("/warehouses")
    public ResponseEntity<ApiResponse<List<Warehouse>>> getAllWarehouses() {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.getAllWarehouses()));
    }

    @PostMapping("/warehouses")
    public ResponseEntity<ApiResponse<Warehouse>> createWarehouse(@Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity
                .ok(ApiResponse.success("Warehouse created successfully", warehouseService.createWarehouse(request)));
    }

    @PutMapping("/warehouses/{id}")
    public ResponseEntity<ApiResponse<Warehouse>> updateWarehouse(@PathVariable String id,
            @RequestBody WarehouseRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Warehouse updated successfully", warehouseService.updateWarehouse(id, request)));
    }

    @DeleteMapping("/warehouses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWarehouse(@PathVariable String id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.ok(ApiResponse.success("Warehouse deleted successfully", null));
    }

    // ========== Inventory Management ==========

    @GetMapping("/inventory/low-stock")
    public ResponseEntity<ApiResponse<List<com.ecommerce.model.Product>>> getLowStockAlerts() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getLowStockAlerts()));
    }

    @PostMapping("/inventory/update-stock")
    public ResponseEntity<ApiResponse<Void>> updateStock(
            @RequestParam String productId,
            @RequestParam int change,
            @RequestParam com.ecommerce.model.StockHistory.StockChangeType type,
            @RequestParam(required = false) String notes) {
        inventoryService.updateStock(productId, change, type, notes, "ADMIN_MANUAL");
        return ResponseEntity.ok(ApiResponse.success("Stock updated successfully", null));
    }

    // ========== Coupon Management ==========

    @GetMapping("/coupons")
    public ResponseEntity<ApiResponse<List<Coupon>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.success(couponRepository.findAll()));
    }

    @PostMapping("/coupons")
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(@Valid @RequestBody CouponRequest request) {
        Coupon coupon = Coupon.builder()
                .code(request.getCode())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .startDate(request.getStartDate())
                .expiryDate(request.getExpiryDate())
                .usageLimit(request.getUsageLimit())
                .active(request.isActive())
                .applicableCategoryIds(request.getApplicableCategoryIds())
                .applicableProductIds(request.getApplicableProductIds())
                .build();
        return ResponseEntity.ok(ApiResponse.success("Coupon created successfully", couponRepository.save(coupon)));
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<Coupon>> updateCoupon(@PathVariable String id,
            @RequestBody CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new com.ecommerce.exception.ResourceNotFoundException("Coupon", "id", id));
        coupon.setCode(request.getCode());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setStartDate(request.getStartDate());
        coupon.setExpiryDate(request.getExpiryDate());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setActive(request.isActive());
        coupon.setApplicableCategoryIds(request.getApplicableCategoryIds());
        coupon.setApplicableProductIds(request.getApplicableProductIds());
        return ResponseEntity.ok(ApiResponse.success("Coupon updated successfully", couponRepository.save(coupon)));
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable String id) {
        couponRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted successfully", null));
    }

    // ========== Reports & Analytics ==========

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<com.ecommerce.dto.response.ReportsResponse>> getReports(
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(reportService.generateFullReport(startDate, endDate)));
    }

    // ========== Admin Role Management ==========

    @GetMapping("/admin-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<com.ecommerce.model.User>>> getAdminUsers() {
        return ResponseEntity.ok(ApiResponse.success(adminManagementService.getAllAdmins()));
    }

    @PutMapping("/admin-users/{id}/permissions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<com.ecommerce.model.User>> updatePermissions(
            @PathVariable String id,
            @RequestBody java.util.Set<String> permissions) {
        return ResponseEntity.ok(ApiResponse.success("Permissions updated",
                adminManagementService.updateAdminPermissions(id, permissions)));
    }

    @GetMapping("/activity-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<com.ecommerce.model.AdminActivityLog>>> getActivityLogs() {
        return ResponseEntity.ok(ApiResponse.success(adminManagementService.getAllLogs()));
    }
}
