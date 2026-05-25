package com.smartcart.api.domain.review;

import com.smartcart.api.domain.review.dto.ReviewRequestDto;
import com.smartcart.api.domain.review.dto.ReviewResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Product Reviews", description = "Endpoints for customer feedback, ratings, and catalog average scores")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/products/{productId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Submit a product review (Verified Purchases Only)", description = "Allows a registered user to submit a 1-5 star review. Restricts actions to users who have a verified past order containing this product. Enforces a one-review-per-item limit.")
    @ApiResponse(responseCode = "201", description = "Review posted successfully")
    @ApiResponse(responseCode = "400", description = "User has not purchased the item, duplicate review detected, or validation constraints failed")
    @ApiResponse(responseCode = "404", description = "Product ID not found")
    public ResponseEntity<ReviewResponseDto> createReview(
            Authentication authentication,
            @PathVariable UUID productId,
            @Valid @RequestBody ReviewRequestDto dto) {
        
        String email = authentication.getName();
        ReviewResponseDto response = reviewService.createReview(email, productId, dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/products/{productId}")
    @Operation(summary = "Get paginated reviews for a product", description = "Retrieves a public, paginated list of all customer reviews submitted for a specific product.")
    @ApiResponse(responseCode = "200", description = "Successful retrieval")
    @ApiResponse(responseCode = "404", description = "Product ID not found")
    public ResponseEntity<Page<ReviewResponseDto>> getProductReviews(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<ReviewResponseDto> reviews = reviewService.getProductReviews(productId, page, size);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/products/{productId}/average")
    @Operation(summary = "Get average star rating score", description = "Executes a high-performance database aggregate query to compute the average rating score of a product.")
    @ApiResponse(responseCode = "200", description = "Successful calculation")
    @ApiResponse(responseCode = "404", description = "Product ID not found")
    public ResponseEntity<Map<String, Object>> getAverageRating(@PathVariable UUID productId) {
        Double avgRating = reviewService.getAverageRating(productId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("productId", productId);
        response.put("averageRating", avgRating);
        
        return ResponseEntity.ok(response);
    }
}
