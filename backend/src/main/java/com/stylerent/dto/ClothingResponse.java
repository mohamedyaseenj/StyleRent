package com.stylerent.dto;

import com.stylerent.entity.Clothing;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ClothingResponse(
        Long id,
        Long hostId,
        String hostName,
        Long categoryId,
        String categoryName,
        String name,
        String description,
        BigDecimal pricePerDay,
        BigDecimal price1Day,
        BigDecimal price2Day,
        BigDecimal price3Day,
        BigDecimal price1Week,
        String imageUrl,
        String color,
        Integer stock,
        String gender,
        Boolean active,
        List<ClothingSizeResponse> sizes,
        LocalDateTime createdAt
) {

    public static ClothingResponse from(Clothing clothing, List<ClothingSizeResponse> sizes) {
        return new ClothingResponse(
                clothing.getClothingId(),
                clothing.getHost() != null ? clothing.getHost().getUserId() : null,
                clothing.getHost() != null ? clothing.getHost().getName() : null,
                clothing.getCategory() != null ? clothing.getCategory().getCategoryId() : null,
                clothing.getCategory() != null ? clothing.getCategory().getCategoryName() : null,
                clothing.getName(),
                clothing.getDescription(),
                clothing.getPricePerDay(),
                clothing.getPrice1Day(),
                clothing.getPrice2Day(),
                clothing.getPrice3Day(),
                clothing.getPrice1Week(),
                clothing.getImageUrl(),
                clothing.getColor(),
                clothing.getStock(),
                clothing.getGender(),
                clothing.getActive(),
                sizes,
                clothing.getCreatedAt()
        );
    }

    public static ClothingResponse from(Clothing clothing) {
        return from(clothing, List.of());
    }
}