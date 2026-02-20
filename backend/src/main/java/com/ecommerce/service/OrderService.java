package com.ecommerce.service;

import com.ecommerce.dto.request.OrderRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.Cart;
import com.ecommerce.model.Order;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.repository.CouponRepository;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;
    private final UserService userService;
    private final PaymentService paymentService;
    private final InventoryService inventoryService;
    private final CouponService couponService;
    private final CouponRepository couponRepository;
    private final MailService mailService;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.18"); // 18% tax
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("500");
    private static final BigDecimal SHIPPING_COST = new BigDecimal("50");

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        User user = userService.getCurrentUser();
        Cart cart = cartService.getCartEntity();

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Validate stock and create order items
        List<Order.OrderItem> orderItems = cart.getItems().stream()
                .map(cartItem -> {
                    Product product = productRepository.findById(cartItem.getProductId())
                            .orElseThrow(() -> new ResourceNotFoundException("Product", "id", cartItem.getProductId()));

                    if (product.getStockQuantity() < cartItem.getQuantity()) {
                        throw new BadRequestException("Insufficient stock for " + product.getName());
                    }

                    return Order.OrderItem.builder()
                            .productId(cartItem.getProductId())
                            .productName(cartItem.getProductName())
                            .productImage(cartItem.getProductImage())
                            .price(cartItem.getPrice())
                            .quantity(cartItem.getQuantity())
                            .subtotal(cartItem.getSubtotal())
                            .build();
                })
                .collect(Collectors.toList());

        BigDecimal subtotal = cart.getItems().stream()
                .map(Cart.CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountAmount = cart.getDiscount() != null ? cart.getDiscount() : BigDecimal.ZERO;
        String couponCode = cart.getAppliedCoupon();

        BigDecimal taxableAmount = subtotal.subtract(discountAmount);
        BigDecimal shippingCost = taxableAmount.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
                ? BigDecimal.ZERO
                : SHIPPING_COST;
        BigDecimal tax = taxableAmount.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = taxableAmount.add(shippingCost).add(tax);

        Order.ShippingAddress shippingAddress = Order.ShippingAddress.builder()
                .fullName(request.getShippingAddress().getFullName())
                .phone(request.getShippingAddress().getPhone())
                .street(request.getShippingAddress().getStreet())
                .city(request.getShippingAddress().getCity())
                .state(request.getShippingAddress().getState())
                .zipCode(request.getShippingAddress().getZipCode())
                .country(request.getShippingAddress().getCountry())
                .build();

        // Generate order number
        String orderNumber = "ORD" + System.currentTimeMillis();
        String userName = (user.getFirstName() != null ? user.getFirstName() : "") +
                (user.getLastName() != null ? " " + user.getLastName() : "");

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .userId(user.getId())
                .userName(userName.trim().isEmpty() ? "Customer" : userName.trim())
                .userEmail(user.getEmail())
                .items(orderItems)
                .shippingAddress(shippingAddress)
                .subtotal(subtotal)
                .shippingCost(shippingCost)
                .tax(tax)
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .couponCode(couponCode)
                .status(Order.OrderStatus.PENDING)
                .paymentStatus(Order.PaymentStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .build();

        order = orderRepository.save(order);

        // Deduct stock using InventoryService
        Order finalOrder = order;
        finalOrder.getItems().forEach(item -> inventoryService.deductStockForOrder(item.getProductId(),
                item.getQuantity(), finalOrder.getId()));

        // Record coupon usage if applicable
        if (couponCode != null) {
            couponRepository.findByCode(couponCode).ifPresent(
                    coupon -> couponService.recordCouponUsage(coupon.getId(), user.getId(), finalOrder.getId()));
        }

        // Process payment (dummy implementation)
        paymentService.processPayment(order, request.getPaymentMethod());

        // Send order confirmation email
        String addressString = order.getShippingAddress().getStreet() + ", " +
                order.getShippingAddress().getCity() + ", " +
                order.getShippingAddress().getState() + " - " +
                order.getShippingAddress().getZipCode() + ", " +
                order.getShippingAddress().getCountry();

        mailService.sendOrderConfirmationEmail(order.getUserEmail(), order.getUserName(), order.getOrderNumber(),
                order.getCreatedAt().toString(), order.getTotalAmount().doubleValue(),
                order.getPaymentMethod(), addressString);

        // Send invoice email
        mailService.sendInvoiceEmail(order.getUserEmail(), order.getUserName(), order.getOrderNumber(),
                "http://localhost:5173/orders/" + order.getId() + "/invoice");

        // Clear cart after successful order
        cartService.clearCart();

        return OrderResponse.fromOrder(order);
    }

    public Page<OrderResponse> getUserOrders(Pageable pageable) {
        User user = userService.getCurrentUser();
        return orderRepository.findByUserId(user.getId(), pageable)
                .map(OrderResponse::fromOrder);
    }

    public OrderResponse getOrderById(String orderId) {
        User user = userService.getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Verify order belongs to user or user is admin
        if (!order.getUserId().equals(user.getId()) &&
                !user.getRoles().contains(User.Role.ADMIN)) {
            throw new BadRequestException("Access denied");
        }

        return OrderResponse.fromOrder(order);
    }

    public Order getOrderEntity(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
    }

    public OrderResponse cancelOrder(String orderId) {
        User user = userService.getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUserId().equals(user.getId())) {
            throw new BadRequestException("Access denied");
        }

        if (order.getStatus() != Order.OrderStatus.PENDING &&
                order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled at this stage");
        }

        final Order finalOrderToCancel = order;
        // Restore stock using InventoryService
        finalOrderToCancel.getItems().forEach(item -> inventoryService.restoreStockForCancellation(item.getProductId(),
                item.getQuantity(), finalOrderToCancel.getId()));

        order.setStatus(Order.OrderStatus.CANCELLED);
        order = orderRepository.save(order);
        return OrderResponse.fromOrder(order);
    }

    // Admin methods
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(OrderResponse::fromOrder);
    }

    public OrderResponse getOrderByIdAdmin(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return OrderResponse.fromOrder(order);
    }

    public Page<OrderResponse> getOrdersByStatus(Order.OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable).map(OrderResponse::fromOrder);
    }

    public OrderResponse updateOrderStatus(String orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        order.setStatus(newStatus);

        if (newStatus == Order.OrderStatus.SHIPPED) {
            order.setShippedAt(LocalDateTime.now());
        } else if (newStatus == Order.OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        } else if (newStatus == Order.OrderStatus.RETURNED) {
            final Order finalOrderToReturn = order;
            // Restore stock on return using InventoryService
            finalOrderToReturn.getItems().forEach(item -> inventoryService.restoreStockForReturn(item.getProductId(),
                    item.getQuantity(), finalOrderToReturn.getId()));
        } else if (newStatus == Order.OrderStatus.REFUNDED) {
            order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
        }

        order = orderRepository.save(order);

        // Trigger notifications based on status
        if (newStatus == Order.OrderStatus.SHIPPED) {
            mailService.sendOrderShippedEmail(order.getUserEmail(), order.getUserName(), order.getOrderNumber(),
                    order.getTrackingNumber() != null ? order.getTrackingNumber() : "TBA",
                    "Sales Savvy Express", "3-5 business days");
        } else if (newStatus == Order.OrderStatus.DELIVERED) {
            mailService.sendOrderDeliveredEmail(order.getUserEmail(), order.getUserName(), order.getOrderNumber());
        } else if (newStatus == Order.OrderStatus.RETURNED) {
            mailService.sendReturnApprovedEmail(order.getUserEmail(), order.getUserName(), order.getOrderNumber());
        } else if (newStatus == Order.OrderStatus.REFUNDED) {
            mailService.sendRefundProcessedEmail(order.getUserEmail(), order.getUserName(),
                    order.getTotalAmount().doubleValue(), order.getOrderNumber());
        }

        return OrderResponse.fromOrder(order);
    }

    public OrderResponse updateTrackingNumber(String orderId, String trackingNumber) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setTrackingNumber(trackingNumber);
        order = orderRepository.save(order);
        return OrderResponse.fromOrder(order);
    }

    public List<OrderResponse> getOrdersByUserId(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(OrderResponse::fromOrder)
                .collect(Collectors.toList());
    }
}
