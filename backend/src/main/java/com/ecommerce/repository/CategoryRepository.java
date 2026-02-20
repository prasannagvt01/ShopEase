package com.ecommerce.repository;

import com.ecommerce.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {
    List<Category> findByActiveTrue();

    List<Category> findByParentIdIsNullAndActiveTrue();

    List<Category> findByParentIdAndActiveTrue(String parentId);

    Optional<Category> findBySlug(String slug);

    Optional<Category> findByName(String name);

    boolean existsBySlug(String slug);
}
