package com.ecommerce.service;

import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.Product;
import com.ecommerce.model.StockHistory;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.StockHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final StockHistoryRepository stockHistoryRepository;

    @Transactional
    public void updateStock(String productId, int quantityChange, StockHistory.StockChangeType type, String notes,
            String referenceId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        int oldQuantity = product.getStockQuantity();
        int newQuantity = oldQuantity + quantityChange;

        if (newQuantity < 0) {
            throw new BadRequestException("Insufficient stock for product: " + product.getName());
        }

        product.setStockQuantity(newQuantity);
        productRepository.save(product);

        StockHistory history = StockHistory.builder()
                .productId(productId)
                .changeQuantity(quantityChange)
                .newQuantity(newQuantity)
                .type(type)
                .notes(notes)
                .referenceId(referenceId)
                .timestamp(LocalDateTime.now())
                .build();
        stockHistoryRepository.save(history);
    }

    public List<Product> getLowStockAlerts() {
        return productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() <= p.getLowStockThreshold())
                .collect(Collectors.toList());
    }

    @Transactional
    public void deductStockForOrder(String productId, int quantity, String orderId) {
        updateStock(productId, -quantity, StockHistory.StockChangeType.ORDER_PLACEMENT, "Order placed", orderId);
    }

    @Transactional
    public void restoreStockForCancellation(String productId, int quantity, String orderId) {
        updateStock(productId, quantity, StockHistory.StockChangeType.ORDER_CANCELLATION, "Order cancelled", orderId);
    }

    @Transactional
    public void restoreStockForReturn(String productId, int quantity, String orderId) {
        updateStock(productId, quantity, StockHistory.StockChangeType.ORDER_RETURN, "Order returned", orderId);
    }
}
