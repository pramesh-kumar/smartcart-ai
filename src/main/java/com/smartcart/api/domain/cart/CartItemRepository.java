package com.smartcart.api.domain.cart;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    // Basic operations are managed via the Cart aggregate root, but direct repository is useful for custom cleanups
}
