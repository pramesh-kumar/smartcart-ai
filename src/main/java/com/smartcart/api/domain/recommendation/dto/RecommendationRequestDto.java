package com.smartcart.api.domain.recommendation.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationRequestDto {
    
    private BigDecimal maxPrice; // Budget limit
    
    private UUID categoryId; // Category scope
    
    private String intent; // Preference keywords (e.g. "gaming", "office", "silent")
}
