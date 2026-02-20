package com.ecommerce.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "stock_history")
public class StockHistory {
    @Id
    private String id;
    private String productId;
    private int changeQuantity;
    private int newQuantity;
    private StockChangeType type;
    private String notes;
    private String referenceId; // orderId or manual update reference
    private LocalDateTime timestamp;

    public enum StockChangeType {
        MANUAL_UPDATE,
        ORDER_PLACEMENT,
        ORDER_CANCELLATION,
        ORDER_RETURN,
        RESTOCK
    }
}
