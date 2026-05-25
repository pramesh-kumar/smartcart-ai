package com.smartcart.api.domain.order;

import com.smartcart.api.domain.order.dto.OrderRequestDto;
import com.smartcart.api.domain.order.dto.OrderResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Order Transactions", description = "Endpoints for placing orders, retrieving transaction history, and updating shipping status")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Place a new order (Checkout)", description = "Converts all items in the user's active cart into a permanent Order. Debits product stock, freezes unit prices, and purges the cart.")
    @ApiResponse(responseCode = "201", description = "Order placed successfully")
    @ApiResponse(responseCode = "400", description = "Cart is empty, items are out of stock, or invalid request payload")
    public ResponseEntity<OrderResponseDto> placeOrder(
            Authentication authentication,
            @Valid @RequestBody OrderRequestDto dto) {
        String email = authentication.getName();
        OrderResponseDto order = orderService.placeOrder(email, dto);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping("/history")
    @Operation(summary = "Get user order history", description = "Returns a paginated list of all past orders placed by the authenticated user context.")
    public ResponseEntity<Page<OrderResponseDto>> getOrderHistory(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String email = authentication.getName();
        Page<OrderResponseDto> orders = orderService.getOrderHistory(email, page, size);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get single order details by ID", description = "Retrieves complete transactional metadata. Restricts access to the order owner (unless called by an Admin).")
    @ApiResponse(responseCode = "200", description = "Successful retrieval")
    @ApiResponse(responseCode = "403", description = "Access denied (you do not own this order)")
    @ApiResponse(responseCode = "404", description = "Order ID not found")
    public ResponseEntity<OrderResponseDto> getOrderById(
            Authentication authentication,
            @PathVariable UUID orderId) {
        String email = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));
        
        OrderResponseDto order = orderService.getOrderById(email, orderId, isAdmin);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update order status (ADMIN ONLY)", description = "Modifies shipping and checkout status flags (e.g. moving from PENDING to PAID or SHIPPED).")
    @ApiResponse(responseCode = "200", description = "Order status updated successfully")
    @ApiResponse(responseCode = "403", description = "Admin permissions required")
    @ApiResponse(responseCode = "404", description = "Order ID not found")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @PathVariable UUID orderId,
            @RequestParam OrderStatus status) {
        OrderResponseDto updatedOrder = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(updatedOrder);
    }
}
