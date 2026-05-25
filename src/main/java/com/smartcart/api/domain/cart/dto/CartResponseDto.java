package com.smartcart.api.domain.cart.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponseDto {
    private UUID cartId;
    private String userEmail;
    private List<CartItemResponseDto> items;
    private BigDecimal totalCartPrice;
}
