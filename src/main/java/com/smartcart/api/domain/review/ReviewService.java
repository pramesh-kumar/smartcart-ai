package com.smartcart.api.domain.review;

import com.smartcart.api.domain.review.dto.ReviewRequestDto;
import com.smartcart.api.domain.review.dto.ReviewResponseDto;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface ReviewService {
    
    ReviewResponseDto createReview(String email, UUID productId, ReviewRequestDto dto);
    
    Page<ReviewResponseDto> getProductReviews(UUID productId, int page, int size);
    
    Double getAverageRating(UUID productId);
}
