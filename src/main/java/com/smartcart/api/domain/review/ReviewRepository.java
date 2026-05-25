package com.smartcart.api.domain.review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    
    // Enforce single review policy per customer/product
    Boolean existsByUserIdAndProductId(UUID userId, UUID productId);
    
    // Fetch paginated list of reviews for a product
    Page<Review> findByProductId(UUID productId, Pageable pageable);
    
    // High-performance database-level average rating calculation
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.product.id = :productId")
    Double getAverageRatingForProduct(@Param("productId") UUID productId);
}
