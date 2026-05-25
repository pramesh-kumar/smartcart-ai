package com.smartcart.api.domain.cart.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponseDto {
    private UUID cartItemId;
    private UUID productId;
    private String productName;
    private String productSku;
    private BigDecimal productPrice;
    private Integer quantity;
    private BigDecimal totalItemPrice; // quantity * productPrice
}
