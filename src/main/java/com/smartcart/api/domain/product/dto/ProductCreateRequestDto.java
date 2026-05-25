package com.smartcart.api.domain.product.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreateRequestDto {

    @NotBlank(message = "Product name must not be empty")
    @Size(max = 150, message = "Product name must be less than 150 characters")
    private String name;

    @NotBlank(message = "Product description must not be empty")
    private String description;

    @NotNull(message = "Price must not be empty")
    @DecimalMin(value = "0.01", message = "Price must be at least 0.01")
    private BigDecimal price;

    @NotNull(message = "Stock quantity must not be empty")
    @Min(value = 0, message = "Stock quantity must be at least 0")
    private Integer stockQuantity;

    @NotBlank(message = "SKU must not be empty")
    @Size(max = 50, message = "SKU must be less than 50 characters")
    private String sku;

    @NotNull(message = "Category ID must not be empty")
    private UUID categoryId;

    @Size(max = 255, message = "Image URL must be less than 255 characters")
    private String imageUrl;
}
