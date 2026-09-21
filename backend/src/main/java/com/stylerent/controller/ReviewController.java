package com.stylerent.controller;

import com.stylerent.dto.ApiResponse;
import com.stylerent.dto.ReviewRequest;
import com.stylerent.dto.ReviewResponse;
import com.stylerent.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@Tag(name = "Reviews", description = "Customer reviews for clothing items")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    @Operation(summary = "Submit a review for a clothing item")
    public ResponseEntity<ApiResponse<ReviewResponse>> create(@Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Review submitted", reviewService.create(request)));
    }

    @GetMapping("/clothing/{clothingId}")
    @Operation(summary = "List reviews for a clothing item (public)")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> listByClothing(@PathVariable Long clothingId) {
        return ResponseEntity.ok(ApiResponse.ok("Reviews retrieved", reviewService.listByClothing(clothingId)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a review (author or admin)")
    public ResponseEntity<ApiResponse<ReviewResponse>> update(@PathVariable Long id,
                                                              @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Review updated", reviewService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a review (author or admin)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        reviewService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Review deleted"));
    }
}