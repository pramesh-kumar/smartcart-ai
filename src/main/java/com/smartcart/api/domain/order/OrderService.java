package com.smartcart.api.domain.order;

import com.smartcart.api.domain.order.dto.OrderRequestDto;
import com.smartcart.api.domain.order.dto.OrderResponseDto;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface OrderService {
    
    OrderResponseDto placeOrder(String email, OrderRequestDto dto);
    
    OrderResponseDto getOrderById(String email, UUID orderId, boolean isAdmin);
    
    Page<OrderResponseDto> getOrderHistory(String email, int page, int size);
    
    OrderResponseDto updateOrderStatus(UUID orderId, OrderStatus status);
}
