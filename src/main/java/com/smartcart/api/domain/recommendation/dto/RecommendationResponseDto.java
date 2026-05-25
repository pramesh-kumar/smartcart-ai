package com.smartcart.api.domain.recommendation.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponseDto {
    private UUID productId;
    private String productName;
    private BigDecimal price;
    private Double averageRating;
    private Double recommendationScore; // Score from 0 to 100
    private String reason; // AI/Rule-based personalized text explanation
}
