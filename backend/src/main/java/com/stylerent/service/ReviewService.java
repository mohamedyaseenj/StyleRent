package com.stylerent.service;

import com.stylerent.dto.ReviewRequest;
import com.stylerent.dto.ReviewResponse;
import com.stylerent.entity.Clothing;
import com.stylerent.entity.Review;
import com.stylerent.entity.User;
import com.stylerent.exception.ResourceNotFoundException;
import com.stylerent.exception.UnauthorizedException;
import com.stylerent.repository.ClothingRepository;
import com.stylerent.repository.ReviewRepository;
import com.stylerent.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ClothingRepository clothingRepository;
    private final SecurityUtils securityUtils;

    public ReviewService(ReviewRepository reviewRepository,
                         ClothingRepository clothingRepository,
                         SecurityUtils securityUtils) {
        this.reviewRepository = reviewRepository;
        this.clothingRepository = clothingRepository;
        this.securityUtils = securityUtils;
    }

    @Transactional
    public ReviewResponse create(ReviewRequest request) {
        User user = securityUtils.currentUser();
        Clothing clothing = clothingRepository.findById(request.clothingId())
                .orElseThrow(() -> new ResourceNotFoundException("Clothing not found with id: " + request.clothingId()));

        Review review = new Review();
        review.setUser(user);
        review.setClothing(clothing);
        review.setRating(request.rating().byteValue());
        review.setComment(request.comment());
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> listByClothing(Long clothingId) {
        return reviewRepository.findByClothing_ClothingIdOrderByCreatedAtDesc(clothingId).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> listByUser(Long userId) {
        return reviewRepository.findByUser_UserIdOrderByCreatedAtDesc(userId).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> listAll() {
        return reviewRepository.findAll().stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional
    public ReviewResponse update(Long id, ReviewRequest request) {
        Review review = findReview(id);
        requireOwnerOrAdmin(review);

        Clothing clothing = review.getClothing();
        if (request.clothingId() != null && !request.clothingId().equals(clothing.getClothingId())) {
            clothing = clothingRepository.findById(request.clothingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Clothing not found with id: " + request.clothingId()));
            review.setClothing(clothing);
        }
        review.setRating(request.rating().byteValue());
        review.setComment(request.comment());
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional
    public void delete(Long id) {
        Review review = findReview(id);
        requireOwnerOrAdmin(review);
        reviewRepository.delete(review);
    }

    private Review findReview(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
    }

    private void requireOwnerOrAdmin(Review review) {
        User user = securityUtils.currentUser();
        boolean owner = review.getUser().getUserId().equals(user.getUserId());
        boolean admin = "ADMIN".equals(user.getRole());
        if (!owner && !admin) {
            throw new UnauthorizedException("You can only modify your own reviews");
        }
    }
}