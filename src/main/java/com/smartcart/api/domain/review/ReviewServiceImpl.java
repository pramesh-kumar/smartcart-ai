package com.smartcart.api.domain.review;

import com.smartcart.api.domain.order.OrderRepository;
import com.smartcart.api.domain.product.Product;
import com.smartcart.api.domain.product.ProductRepository;
import com.smartcart.api.domain.review.dto.ReviewRequestDto;
import com.smartcart.api.domain.review.dto.ReviewResponseDto;
import com.smartcart.api.domain.user.User;
import com.smartcart.api.domain.user.UserRepository;
import com.smartcart.api.exception.BadRequestException;
import com.smartcart.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public ReviewResponseDto createReview(String email, UUID productId, ReviewRequestDto dto) {
        // 1. Fetch User and Product
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        // 2. Enforce verified purchases only (Amazon-style business rule)
        Boolean hasPurchased = orderRepository.hasUserPurchasedProduct(email, productId);
        if (!hasPurchased) {
            throw new BadRequestException("Access Denied: You can only review products that you have actually purchased!");
        }

        // 3. Prevent duplicate reviews (a user can only review a product once)
        if (reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            throw new BadRequestException("Duplicate Review: You have already submitted a review for this product!");
        }

        // 4. Save review
        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);
        return mapToResponseDto(savedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponseDto> getProductReviews(UUID productId, int page, int size) {
        // Verify product exists first
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product", "id", productId);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> reviewsPage = reviewRepository.findByProductId(productId, pageable);
        
        return reviewsPage.map(this::mapToResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageRating(UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product", "id", productId);
        }
        return reviewRepository.getAverageRatingForProduct(productId);
    }

    // --- Helper Utility Methods ---

    private ReviewResponseDto mapToResponseDto(Review review) {
        return ReviewResponseDto.builder()
                .reviewId(review.getId())
                .userEmail(review.getUser().getEmail())
                .userName(review.getUser().getFirstName() + " " + review.getUser().getLastName())
                .productId(review.getProduct().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
