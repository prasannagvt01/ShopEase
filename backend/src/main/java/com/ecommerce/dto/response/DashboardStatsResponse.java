package com.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalProducts;
    private long totalUsers;
    private long pendingOrders;
    private long completedOrders;
    private long activeProducts;
    private long lowStockProducts;

    // Revenue breakdown
    private BigDecimal dailyRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal yearlyRevenue;

    // Order summary
    private long confirmedOrders;
    private long processingOrders;
    private long shippedOrders;
    private long cancelledOrders;

    // Top selling products
    private List<TopProduct> topSellingProducts;

    // Low stock alerts
    private List<LowStockProduct> lowStockAlerts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProduct {
        private String id;
        private String name;
        private String image;
        private BigDecimal price;
        private int totalSold;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowStockProduct {
        private String id;
        private String name;
        private String image;
        private int stockQuantity;
        private BigDecimal price;
    }
}
