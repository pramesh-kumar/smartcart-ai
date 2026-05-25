package com.smartcart.api.domain.cart;

import com.smartcart.api.domain.cart.dto.CartItemRequestDto;
import com.smartcart.api.domain.cart.dto.CartResponseDto;

import java.util.UUID;

public interface CartService {
    
    CartResponseDto getCart(String email);
    
    CartResponseDto addItemToCart(String email, CartItemRequestDto dto);
    
    CartResponseDto updateCartItemQuantity(String email, UUID cartItemId, Integer quantity);
    
    CartResponseDto removeItemFromCart(String email, UUID cartItemId);
}
