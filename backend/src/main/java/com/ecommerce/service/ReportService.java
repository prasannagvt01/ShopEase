package com.ecommerce.service;

import com.ecommerce.dto.response.ReportsResponse;
import com.ecommerce.model.Order;
import com.ecommerce.model.User;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public ReportsResponse generateFullReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        List<Order> orders = orderRepository.findByCreatedAtBetween(start, end);
        List<Order> completedOrders = orders.stream()
                .filter(o -> o.getStatus() != Order.OrderStatus.CANCELLED
                        && o.getStatus() != Order.OrderStatus.REFUNDED)
                .toList();

        return ReportsResponse.builder()
                .salesReport(generateSalesReport(completedOrders))
                .customerReport(generateCustomerReport(completedOrders, start, end))
                .productPerformanceReport(generateProductPerformanceReport(completedOrders))
                .revenueTaxReport(generateRevenueTaxReport(completedOrders))
                .profitLossReport(generateProfitLossReport(completedOrders))
                .build();
    }

    private ReportsResponse.SalesReport generateSalesReport(List<Order> orders) {
        Map<LocalDate, BigDecimal> dailyData = orders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().toLocalDate(),
                        Collectors.reducing(BigDecimal.ZERO, Order::getTotalAmount, BigDecimal::add)));

        BigDecimal totalSales = orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ReportsResponse.SalesReport.builder()
                .dailySales(dailyData)
                .totalSales(totalSales)
                .totalOrders(orders.size())
                .averageOrderValue(orders.isEmpty() ? BigDecimal.ZERO
                        : totalSales.divide(BigDecimal.valueOf(orders.size()), 2, RoundingMode.HALF_UP))
                .build();
    }

    private ReportsResponse.CustomerReport generateCustomerReport(List<Order> completedOrders, LocalDateTime start,
            LocalDateTime end) {
        long totalCustomers = userRepository.count();
        long newCustomers = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(start)
                        && u.getCreatedAt().isBefore(end))
                .count();

        Map<String, List<Order>> ordersByUser = completedOrders.stream()
                .collect(Collectors.groupingBy(Order::getUserId));

        List<ReportsResponse.TopCustomer> topCustomers = ordersByUser.entrySet().stream()
                .map(entry -> {
                    String userId = entry.getKey();
                    List<Order> userOrders = entry.getValue();
                    User user = userRepository.findById(userId).orElse(null);
                    BigDecimal spent = userOrders.stream().map(Order::getTotalAmount).reduce(BigDecimal.ZERO,
                            BigDecimal::add);

                    return ReportsResponse.TopCustomer.builder()
                            .userId(userId)
                            .name(user != null ? user.getFirstName() + " " + user.getLastName() : "Unknown")
                            .email(user != null ? user.getEmail() : "N/A")
                            .totalOrders(userOrders.size())
                            .totalSpent(spent)
                            .build();
                })
                .sorted((c1, c2) -> c2.getTotalSpent().compareTo(c1.getTotalSpent()))
                .limit(10)
                .toList();

        return ReportsResponse.CustomerReport.builder()
                .totalCustomers(totalCustomers)
                .newCustomersThisMonth(newCustomers)
                .topCustomers(topCustomers)
                .build();
    }

    private ReportsResponse.ProductPerformanceReport generateProductPerformanceReport(List<Order> orders) {
        Map<String, ReportsResponse.ProductMetric> metrics = new HashMap<>();

        for (Order order : orders) {
            for (Order.OrderItem item : order.getItems()) {
                metrics.compute(item.getProductId(), (id, existing) -> {
                    if (existing == null) {
                        return ReportsResponse.ProductMetric.builder()
                                .productId(id)
                                .productName(item.getProductName())
                                .quantitySold(item.getQuantity())
                                .revenueGenerated(item.getSubtotal())
                                .build();
                    } else {
                        existing.setQuantitySold(existing.getQuantitySold() + item.getQuantity());
                        existing.setRevenueGenerated(existing.getRevenueGenerated().add(item.getSubtotal()));
                        return existing;
                    }
                });
            }
        }

        List<ReportsResponse.ProductMetric> topByRevenue = metrics.values().stream()
                .sorted((m1, m2) -> m2.getRevenueGenerated().compareTo(m1.getRevenueGenerated()))
                .limit(10)
                .toList();

        List<ReportsResponse.ProductMetric> topByQuantity = metrics.values().stream()
                .sorted((m1, m2) -> Integer.compare(m2.getQuantitySold(), m1.getQuantitySold()))
                .limit(10)
                .toList();

        return ReportsResponse.ProductPerformanceReport.builder()
                .topProductsByRevenue(topByRevenue)
                .topProductsByQuantity(topByQuantity)
                .build();
    }

    private ReportsResponse.RevenueTaxReport generateRevenueTaxReport(List<Order> orders) {
        BigDecimal totalGross = orders.stream().map(Order::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalTax = orders.stream().map(o -> o.getTax() != null ? o.getTax() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalDiscount = orders.stream()
                .map(o -> o.getDiscountAmount() != null ? o.getDiscountAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ReportsResponse.RevenueTaxReport.builder()
                .totalGrossRevenue(totalGross)
                .totalTaxCollected(totalTax)
                .totalDiscounts(totalDiscount)
                .netRevenue(totalGross.subtract(totalTax))
                .build();
    }

    private ReportsResponse.ProfitLossReport generateProfitLossReport(List<Order> orders) {
        BigDecimal totalRevenue = orders.stream().map(Order::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        // Assuming 60% is cost as placeholder since we don't have base cost in product
        // model
        BigDecimal estimatedCost = totalRevenue.multiply(new BigDecimal("0.6")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal profit = totalRevenue.subtract(estimatedCost);

        return ReportsResponse.ProfitLossReport.builder()
                .totalRevenue(totalRevenue)
                .totalCost(estimatedCost)
                .grossProfit(profit)
                .profitMarginPercentage(totalRevenue.equals(BigDecimal.ZERO) ? BigDecimal.ZERO
                        : profit.multiply(new BigDecimal("100")).divide(totalRevenue, 2, RoundingMode.HALF_UP))
                .build();
    }
}
