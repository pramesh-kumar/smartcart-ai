package com.smartcart.api.domain.review.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDto {
    private UUID reviewId;
    private String userEmail;
    private String userName; // "FirstName LastName" combined
    private UUID productId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
