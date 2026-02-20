package com.ecommerce.service;

import com.ecommerce.dto.response.DashboardStatsResponse;
import com.ecommerce.model.Order;
import com.ecommerce.model.Product;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

        private final OrderRepository orderRepository;
        private final ProductRepository productRepository;
        private final UserRepository userRepository;

        public DashboardStatsResponse getDashboardStats() {
                // ── Basic counts ────────────────────────────────
                long totalOrders = orderRepository.count();
                long totalProducts = productRepository.count();
                long totalUsers = userRepository.count();
                long activeProducts = productRepository.countByActiveTrue();
                long lowStockCount = productRepository.countByStockQuantityLessThan(10);

                // ── Order status counts ─────────────────────────
                long pendingOrders = orderRepository.countByStatus(Order.OrderStatus.PENDING);
                long confirmedOrders = orderRepository.countByStatus(Order.OrderStatus.CONFIRMED);
                long processingOrders = orderRepository.countByStatus(Order.OrderStatus.PROCESSING);
                long shippedOrders = orderRepository.countByStatus(Order.OrderStatus.SHIPPED);
                long completedOrders = orderRepository.countByStatus(Order.OrderStatus.DELIVERED);
                long cancelledOrders = orderRepository.countByStatus(Order.OrderStatus.CANCELLED);

                // ── Revenue calculations ────────────────────────
                // Total revenue = all non-cancelled orders
                List<Order> allOrders = orderRepository.findAll();
                BigDecimal totalRevenue = allOrders.stream()
                                .filter(o -> o.getStatus() != Order.OrderStatus.CANCELLED
                                                && o.getStatus() != Order.OrderStatus.REFUNDED)
                                .map(Order::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Daily revenue (today)
                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
                List<Order> todayOrders = orderRepository.findByCreatedAtBetween(startOfDay, endOfDay);
                BigDecimal dailyRevenue = todayOrders.stream()
                                .filter(o -> o.getStatus() != Order.OrderStatus.CANCELLED
                                                && o.getStatus() != Order.OrderStatus.REFUNDED)
                                .map(Order::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Monthly revenue (current month)
                LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
                List<Order> monthOrders = orderRepository.findByCreatedAtBetween(startOfMonth, endOfDay);
                BigDecimal monthlyRevenue = monthOrders.stream()
                                .filter(o -> o.getStatus() != Order.OrderStatus.CANCELLED
                                                && o.getStatus() != Order.OrderStatus.REFUNDED)
                                .map(Order::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Yearly revenue (current year)
                LocalDateTime startOfYear = LocalDate.now().withDayOfYear(1).atStartOfDay();
                List<Order> yearOrders = orderRepository.findByCreatedAtBetween(startOfYear, endOfDay);
                BigDecimal yearlyRevenue = yearOrders.stream()
                                .filter(o -> o.getStatus() != Order.OrderStatus.CANCELLED
                                                && o.getStatus() != Order.OrderStatus.REFUNDED)
                                .map(Order::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // ── Top selling products ────────────────────────
                // Aggregate from order items
                Map<String, Integer> productSalesCount = new HashMap<>();
                Map<String, BigDecimal> productSalesRevenue = new HashMap<>();
                Map<String, String> productNames = new HashMap<>();

                for (Order order : allOrders) {
                        if (order.getStatus() == Order.OrderStatus.CANCELLED
                                        || order.getStatus() == Order.OrderStatus.REFUNDED)
                                continue;
                        if (order.getItems() == null)
                                continue;

                        for (Order.OrderItem item : order.getItems()) {
                                String pid = item.getProductId();
                                productSalesCount.merge(pid, item.getQuantity(), Integer::sum);
                                productSalesRevenue.merge(pid,
                                                item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO,
                                                BigDecimal::add);
                                productNames.putIfAbsent(pid, item.getProductName());
                        }
                }

                List<DashboardStatsResponse.TopProduct> topProducts = productSalesCount.entrySet().stream()
                                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                                .limit(5)
                                .map(entry -> {
                                        String pid = entry.getKey();
                                        Product product = productRepository.findById(pid).orElse(null);
                                        return DashboardStatsResponse.TopProduct.builder()
                                                        .id(pid)
                                                        .name(productNames.getOrDefault(pid, "Unknown"))
                                                        .image(product != null && product.getImages() != null
                                                                        && !product.getImages().isEmpty()
                                                                                        ? product.getImages().get(0)
                                                                                        : null)
                                                        .price(product != null ? product.getPrice() : BigDecimal.ZERO)
                                                        .totalSold(entry.getValue())
                                                        .totalRevenue(productSalesRevenue.getOrDefault(pid,
                                                                        BigDecimal.ZERO))
                                                        .build();
                                })
                                .collect(Collectors.toList());

                // ── Low stock alerts ────────────────────────────
                List<Product> lowStockProductList = productRepository.findByStockQuantityLessThanAndActiveTrue(10);
                List<DashboardStatsResponse.LowStockProduct> lowStockAlerts = lowStockProductList.stream()
                                .sorted(Comparator.comparingInt(Product::getStockQuantity))
                                .limit(10)
                                .map(p -> DashboardStatsResponse.LowStockProduct.builder()
                                                .id(p.getId())
                                                .name(p.getName())
                                                .image(p.getImages() != null && !p.getImages().isEmpty()
                                                                ? p.getImages().get(0)
                                                                : null)
                                                .stockQuantity(p.getStockQuantity())
                                                .price(p.getPrice())
                                                .build())
                                .collect(Collectors.toList());

                return DashboardStatsResponse.builder()
                                .totalRevenue(totalRevenue)
                                .totalOrders(totalOrders)
                                .totalProducts(totalProducts)
                                .totalUsers(totalUsers)
                                .pendingOrders(pendingOrders)
                                .completedOrders(completedOrders)
                                .activeProducts(activeProducts)
                                .lowStockProducts(lowStockCount)
                                // Revenue breakdown
                                .dailyRevenue(dailyRevenue)
                                .monthlyRevenue(monthlyRevenue)
                                .yearlyRevenue(yearlyRevenue)
                                // Order statuses
                                .confirmedOrders(confirmedOrders)
                                .processingOrders(processingOrders)
                                .shippedOrders(shippedOrders)
                                .cancelledOrders(cancelledOrders)
                                // Lists
                                .topSellingProducts(topProducts)
                                .lowStockAlerts(lowStockAlerts)
                                .build();
        }
}
