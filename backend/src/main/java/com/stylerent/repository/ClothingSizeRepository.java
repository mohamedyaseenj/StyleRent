package com.stylerent.repository;

import com.stylerent.entity.ClothingSize;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClothingSizeRepository extends JpaRepository<ClothingSize, Integer> {

    List<ClothingSize> findByClothing_ClothingIdOrderByClothingSizeIdAsc(Long clothingId);

    Optional<ClothingSize> findByClothing_ClothingIdAndSize(Long clothingId, String size);

    List<ClothingSize> findBySize(String size);
}