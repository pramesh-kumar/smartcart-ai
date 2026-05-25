package com.smartcart.api.domain.order;

import com.smartcart.api.domain.cart.Cart;
import com.smartcart.api.domain.cart.CartRepository;
import com.smartcart.api.domain.order.dto.OrderItemResponseDto;
import com.smartcart.api.domain.order.dto.OrderRequestDto;
import com.smartcart.api.domain.order.dto.OrderResponseDto;
import com.smartcart.api.domain.product.Product;
import com.smartcart.api.domain.product.ProductRepository;
import com.smartcart.api.domain.user.User;
import com.smartcart.api.domain.user.UserRepository;
import com.smartcart.api.exception.BadRequestException;
import com.smartcart.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public OrderResponseDto placeOrder(String email, OrderRequestDto dto) {
        // 1. Fetch active shopping cart
        Cart cart = cartRepository.findByUserEmail(email)
                .orElseThrow(() -> new BadRequestException("No active shopping cart found. Add items to cart first!"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Your shopping cart is empty!");
        }

        // 2. Fetch authenticated User
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // 3. Instantiate the Order
        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .shippingAddress(dto.getShippingAddress())
                .paymentMethod(dto.getPaymentMethod())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal runningTotal = BigDecimal.ZERO;

        // 4. Process each CartItem in the transaction
        for (var cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            int orderQuantity = cartItem.getQuantity();

            // Verify stock inventory limits
            if (product.getStockQuantity() < orderQuantity) {
                throw new BadRequestException("Insufficient inventory available for '" + product.getName() 
                        + "'! Remaining stock: " + product.getStockQuantity());
            }

            // Debit Product Stock
            product.setStockQuantity(product.getStockQuantity() - orderQuantity);
            productRepository.save(product);

            // Snapshot price inside OrderItem to freeze history
            BigDecimal unitPrice = product.getPrice();
            BigDecimal totalItemPrice = unitPrice.multiply(BigDecimal.valueOf(orderQuantity));
            runningTotal = runningTotal.add(totalItemPrice);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(orderQuantity)
                    .unitPrice(unitPrice)
                    .build();

            order.addItem(orderItem);
        }

        order.setTotalAmount(runningTotal);
        Order savedOrder = orderRepository.save(order);

        // 5. Clear the shopping cart (orphanRemoval automatically deletes records from PostgreSQL)
        cart.getItems().clear();
        cartRepository.save(cart);

        return mapToResponseDto(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDto getOrderById(String email, UUID orderId, boolean isAdmin) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Security Check: Enforce user ownership of orders (unless Caller is Admin)
        if (!isAdmin && !order.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Access Denied: You do not own this order resource!");
        }

        return mapToResponseDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponseDto> getOrderHistory(String email, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByUserEmail(email, pageable);
        return orders.map(this::mapToResponseDto);
    }

    @Override
    @Transactional
    public OrderResponseDto updateOrderStatus(UUID orderId, OrderStatus status) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return mapToResponseDto(updatedOrder);
    }

    // --- Helper Utility Methods ---

    private OrderResponseDto mapToResponseDto(Order order) {
        List<OrderItemResponseDto> itemDtos = order.getItems().stream()
                .map(item -> {
                    BigDecimal unitPrice = item.getUnitPrice();
                    BigDecimal totalItemPrice = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                    
                    return OrderItemResponseDto.builder()
                            .orderItemId(item.getId())
                            .productId(item.getProduct().getId())
                            .productName(item.getProduct().getName())
                            .productSku(item.getProduct().getSku())
                            .quantity(item.getQuantity())
                            .unitPrice(unitPrice)
                            .totalItemPrice(totalItemPrice)
                            .build();
                })
                .collect(Collectors.toList());

        return OrderResponseDto.builder()
                .orderId(order.getId())
                .userEmail(order.getUser().getEmail())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .items(itemDtos)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
