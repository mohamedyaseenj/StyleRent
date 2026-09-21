package com.stylerent.dto;

import com.stylerent.entity.Clothing;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ClothingResponse(
        Long id,
        Long categoryId,
        String categoryName,
        String name,
        String description,
        BigDecimal pricePerDay,
        String imageUrl,
        String color,
        Integer stock,
        List<ClothingSizeResponse> sizes,
        LocalDateTime createdAt
) {

    public static ClothingResponse from(Clothing clothing, List<ClothingSizeResponse> sizes) {
        return new ClothingResponse(
                clothing.getClothingId(),
                clothing.getCategory() != null ? clothing.getCategory().getCategoryId() : null,
                clothing.getCategory() != null ? clothing.getCategory().getCategoryName() : null,
                clothing.getName(),
                clothing.getDescription(),
                clothing.getPricePerDay(),
                clothing.getImageUrl(),
                clothing.getColor(),
                clothing.getStock(),
                sizes,
                clothing.getCreatedAt()
        );
    }

    public static ClothingResponse from(Clothing clothing) {
        return from(clothing, List.of());
    }
}