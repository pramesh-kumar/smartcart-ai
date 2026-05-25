package com.smartcart.api.domain.cart;

import com.smartcart.api.domain.cart.dto.CartItemRequestDto;
import com.smartcart.api.domain.cart.dto.CartResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Shopping Carts", description = "Endpoints for managing items, quantities, and calculating checkout totals")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current user's shopping cart", description = "Retrieves the active cart for the authenticated user context. Automatically creates an empty cart if one does not exist.")
    @ApiResponse(responseCode = "200", description = "Successful retrieval")
    @ApiResponse(responseCode = "401", description = "User is unauthenticated")
    public ResponseEntity<CartResponseDto> getCart(Authentication authentication) {
        // Spring Security automatically injects the active Authentication Principal
        String email = authentication.getName();
        CartResponseDto cart = cartService.getCart(email);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    @Operation(summary = "Add an item to the shopping cart", description = "Adds a product to the cart. If the product already exists, it increments the quantity. Enforces stock inventory limits.")
    @ApiResponse(responseCode = "200", description = "Item added successfully")
    @ApiResponse(responseCode = "400", description = "Insufficient inventory stock or input validations failed")
    public ResponseEntity<CartResponseDto> addItemToCart(
            Authentication authentication,
            @Valid @RequestBody CartItemRequestDto dto) {
        String email = authentication.getName();
        CartResponseDto cart = cartService.addItemToCart(email, dto);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{cartItemId}")
    @Operation(summary = "Update item quantity in the cart", description = "Modifies the quantity of a specific item in the cart. Rejects quantities equal to or less than zero.")
    @ApiResponse(responseCode = "200", description = "Quantity updated successfully")
    @ApiResponse(responseCode = "404", description = "Cart item ID not found")
    public ResponseEntity<CartResponseDto> updateCartItemQuantity(
            Authentication authentication,
            @PathVariable UUID cartItemId,
            @RequestParam Integer quantity) {
        String email = authentication.getName();
        CartResponseDto cart = cartService.updateCartItemQuantity(email, cartItemId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{cartItemId}")
    @Operation(summary = "Remove an item from the cart", description = "Purges a cart item. Utilizes database orphan-removal to delete the record in PostgreSQL.")
    @ApiResponse(responseCode = "200", description = "Item removed successfully")
    @ApiResponse(responseCode = "404", description = "Cart item ID not found")
    public ResponseEntity<CartResponseDto> removeItemFromCart(
            Authentication authentication,
            @PathVariable UUID cartItemId) {
        String email = authentication.getName();
        CartResponseDto cart = cartService.removeItemFromCart(email, cartItemId);
        return ResponseEntity.ok(cart);
    }
}
