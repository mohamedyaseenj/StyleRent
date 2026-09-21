package com.stylerent.dto;

import com.stylerent.entity.Review;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Long userId,
        String userName,
        Long clothingId,
        String clothingName,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {

    public static ReviewResponse from(Review review) {
        return new ReviewResponse(
                review.getReviewId(),
                review.getUser().getUserId(),
                review.getUser().getName(),
                review.getClothing().getClothingId(),
                review.getClothing().getName(),
                review.getRating() == null ? null : review.getRating().intValue(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}