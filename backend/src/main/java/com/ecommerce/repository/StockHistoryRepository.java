package com.ecommerce.repository;

import com.ecommerce.model.StockHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StockHistoryRepository extends MongoRepository<StockHistory, String> {
    List<StockHistory> findByProductIdOrderByTimestampDesc(String productId);
}
