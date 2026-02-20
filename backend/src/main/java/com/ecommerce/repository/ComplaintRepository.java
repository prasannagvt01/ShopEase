package com.ecommerce.repository;

import com.ecommerce.model.Complaint;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends MongoRepository<Complaint, String> {
    List<Complaint> findByUserId(String userId);

    List<Complaint> findByStatus(Complaint.ComplaintStatus status);
}
