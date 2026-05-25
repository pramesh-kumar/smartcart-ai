package com.smartcart.api.domain.recommendation;

import com.smartcart.api.domain.category.Category;
import com.smartcart.api.domain.order.Order;
import com.smartcart.api.domain.order.OrderRepository;
import com.smartcart.api.domain.product.Product;
import com.smartcart.api.domain.product.ProductRepository;
import com.smartcart.api.domain.recommendation.dto.RecommendationRequestDto;
import com.smartcart.api.domain.recommendation.dto.RecommendationResponseDto;
import com.smartcart.api.domain.review.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RecommendationResponseDto> getRecommendations(String email, RecommendationRequestDto requestDto) {
        // 1. Fetch candidate products matching basic budget scope
        List<Product> candidates = productRepository.findAll();
        if (requestDto.getMaxPrice() != null) {
            candidates = candidates.stream()
                    .filter(p -> p.getPrice().compareTo(requestDto.getMaxPrice()) <= 0)
                    .collect(Collectors.toList());
        }

        // 2. Fetch User Purchase History to calculate Category Affinity
        Set<UUID> affinityCategoryIds = new HashSet<>();
        try {
            // Load user orders
            var ordersPage = orderRepository.findByUserEmail(email, Pageable.unpaged());
            for (Order order : ordersPage.getContent()) {
                order.getItems().forEach(item -> 
                    affinityCategoryIds.add(item.getProduct().getCategory().getId())
                );
            }
        } catch (Exception ex) {
            // Safe fallback if order repository lookup fails during startup/testing
        }

        List<RecommendationResponseDto> recommendations = new ArrayList<>();

        // 3. Score each product (Maximum Score = 100.0)
        for (Product product : candidates) {
            double score = 0.0;
            List<String> reasons = new ArrayList<>();

            // Rule A: Average Review Rating (Up to 40.0 Points)
            Double avgRating = reviewRepository.getAverageRatingForProduct(product.getId());
            if (avgRating > 0) {
                double ratingScore = avgRating * 8.0; // 5 stars = 40 points
                score += ratingScore;
                reasons.add(String.format("Highly-rated item (avg: %.1f stars)", avgRating));
            } else {
                // Default fallback for new unreviewed products
                score += 24.0; // 3-star equivalent
            }

            // Rule B: Purchase History / Category Affinity (Up to 20.0 Points)
            if (affinityCategoryIds.contains(product.getCategory().getId())) {
                score += 20.0;
                reasons.add(String.format("Aligns with your purchase history in the '%s' category", 
                        product.getCategory().getName()));
            }

            // Rule C: Keyword Intent Matching (Up to 30.0 Points)
            if (requestDto.getIntent() != null && !requestDto.getIntent().isBlank()) {
                String intentLower = requestDto.getIntent().toLowerCase(Locale.ROOT);
                String nameLower = product.getName().toLowerCase(Locale.ROOT);
                String descLower = product.getDescription().toLowerCase(Locale.ROOT);

                if (nameLower.contains(intentLower) || descLower.contains(intentLower)) {
                    score += 30.0;
                    reasons.add(String.format("Matches your preferred keyword '%s'", requestDto.getIntent()));
                }
            }

            // Rule D: Budget Match Optimization (Up to 10.0 Points)
            if (requestDto.getMaxPrice() != null && requestDto.getMaxPrice().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal budget = requestDto.getMaxPrice();
                BigDecimal price = product.getPrice();
                
                // If price fits comfortably within 70% to 100% of budget, give a value boost!
                BigDecimal threshold = budget.multiply(BigDecimal.valueOf(0.70));
                if (price.compareTo(threshold) >= 0 && price.compareTo(budget) <= 0) {
                    score += 10.0;
                    reasons.add("Offers premium specs matching your target budget range");
                } else {
                    score += 5.0;
                    reasons.add("Priced affordably below your target budget");
                }
            }

            // Build dynamic reasoning text
            String finalReason = reasons.isEmpty() 
                    ? "Recommended based on overall system catalog popularity." 
                    : String.join(", and ", reasons) + ".";

            recommendations.add(RecommendationResponseDto.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .price(product.getPrice())
                    .averageRating(avgRating)
                    .recommendationScore(score)
                    .reason(finalReason)
                    .build());
        }

        // 4. Sort descending by recommendationScore and limit to top 5 recommendations
        return recommendations.stream()
                .sorted(Comparator.comparing(RecommendationResponseDto::getRecommendationScore).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }
}
