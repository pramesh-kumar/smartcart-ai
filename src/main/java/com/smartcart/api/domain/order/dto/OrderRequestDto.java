package com.smartcart.api.domain.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDto {

    @NotBlank(message = "Shipping address is mandatory")
    private String shippingAddress;

    @NotBlank(message = "Payment method is mandatory")
    private String paymentMethod; // e.g., "CREDIT_CARD", "PAYPAL", "COD"
}
