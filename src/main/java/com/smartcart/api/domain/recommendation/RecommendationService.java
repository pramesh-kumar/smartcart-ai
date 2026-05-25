package com.smartcart.api.domain.recommendation;

import com.smartcart.api.domain.recommendation.dto.RecommendationRequestDto;
import com.smartcart.api.domain.recommendation.dto.RecommendationResponseDto;

import java.util.List;

public interface RecommendationService {
    
    List<RecommendationResponseDto> getRecommendations(String email, RecommendationRequestDto requestDto);
}
