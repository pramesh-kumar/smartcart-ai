package com.smartcart.api.domain.recommendation;

import com.smartcart.api.domain.recommendation.dto.RecommendationRequestDto;
import com.smartcart.api.domain.recommendation.dto.RecommendationResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "AI Recommendation Engine", description = "Endpoints for user-specific product suggestions matching budgets, past order histories, and preference intent keywords")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PostMapping
    @Operation(summary = "Get Personalized Product Recommendations", description = "Analyzes catalog items, evaluates user's past purchase category affinities, filters average customer review ratings, and performs keyword matches against user intent to return scored product recommendations with dynamic text reasons.")
    @ApiResponse(responseCode = "200", description = "Successful calculation")
    @ApiResponse(responseCode = "401", description = "User is unauthenticated")
    public ResponseEntity<List<RecommendationResponseDto>> getRecommendations(
            Authentication authentication,
            @RequestBody RecommendationRequestDto requestDto) {
        
        String email = authentication.getName();
        List<RecommendationResponseDto> recommendations = recommendationService.getRecommendations(email, requestDto);
        return ResponseEntity.ok(recommendations);
    }
}
