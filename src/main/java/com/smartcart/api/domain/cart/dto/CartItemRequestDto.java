package com.smartcart.api.domain.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequestDto {

    @NotNull(message = "Product ID must not be empty")
    private UUID productId;

    @NotNull(message = "Quantity must not be empty")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
}
