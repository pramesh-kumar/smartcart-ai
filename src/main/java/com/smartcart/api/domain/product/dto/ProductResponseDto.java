package com.smartcart.api.domain.product.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDto {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private String sku;
    private UUID categoryId;
    private String categoryName;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
