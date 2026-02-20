package com.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportsResponse {
    private SalesReport salesReport;
    private CustomerReport customerReport;
    private ProductPerformanceReport productPerformanceReport;
    private RevenueTaxReport revenueTaxReport;
    private ProfitLossReport profitLossReport;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesReport {
        private Map<LocalDate, BigDecimal> dailySales;
        private BigDecimal totalSales;
        private int totalOrders;
        private BigDecimal averageOrderValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerReport {
        private long totalCustomers;
        private long newCustomersThisMonth;
        private List<TopCustomer> topCustomers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopCustomer {
        private String userId;
        private String name;
        private String email;
        private int totalOrders;
        private BigDecimal totalSpent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductPerformanceReport {
        private List<ProductMetric> topProductsByRevenue;
        private List<ProductMetric> topProductsByQuantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductMetric {
        private String productId;
        private String productName;
        private int quantitySold;
        private BigDecimal revenueGenerated;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueTaxReport {
        private BigDecimal totalGrossRevenue;
        private BigDecimal totalTaxCollected;
        private BigDecimal totalDiscounts;
        private BigDecimal netRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfitLossReport {
        private BigDecimal totalRevenue;
        private BigDecimal totalCost; // Estimated or placeholder if not in model
        private BigDecimal grossProfit;
        private BigDecimal profitMarginPercentage;
    }
}
