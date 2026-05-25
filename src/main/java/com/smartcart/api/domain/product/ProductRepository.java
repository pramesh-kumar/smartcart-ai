package com.smartcart.api.domain.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    
    Optional<Product> findBySlug(String slug);
    
    Boolean existsBySku(String sku);
    
    Boolean existsBySlug(String slug);

    @Query("SELECT p FROM Product p JOIN FETCH p.category WHERE " +
           "(:categoryId IS NULL OR p.category.id = :categoryId)")
    Page<Product> searchProductsWithoutKeyword(
            @Param("categoryId") UUID categoryId,
            Pageable pageable
    );

    @Query("SELECT p FROM Product p JOIN FETCH p.category WHERE " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProductsWithKeyword(
            @Param("categoryId") UUID categoryId,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
