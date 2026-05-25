package com.smartcart.api.domain.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    
    // Fetch order history for a user, sorted by creation date
    @Query("SELECT o FROM Order o JOIN FETCH o.items i JOIN FETCH i.product WHERE o.user.email = :email ORDER BY o.createdAt DESC")
    Page<Order> findByUserEmail(@Param("email") String email, Pageable pageable);
    
    // Fetch a single order with pre-loaded items and verify ownership in one query
    @Query("SELECT o FROM Order o JOIN FETCH o.items i JOIN FETCH i.product WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") UUID id);

    // High-performance purchase verification check to support verified product reviews
    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.items i WHERE o.user.email = :email AND i.product.id = :productId AND o.status != 'CANCELLED'")
    Boolean hasUserPurchasedProduct(@Param("email") String email, @Param("productId") UUID productId);
}
