package com.stylerent.repository;

import com.stylerent.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByClothing_ClothingIdOrderByCreatedAtDesc(Long clothingId);

    List<Review> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
}