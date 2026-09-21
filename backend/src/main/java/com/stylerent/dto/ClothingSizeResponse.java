package com.stylerent.dto;

import com.stylerent.entity.ClothingSize;

public record ClothingSizeResponse(Integer id, Long clothingId, String size, Integer stock) {

    public static ClothingSizeResponse from(ClothingSize cs) {
        return new ClothingSizeResponse(
                cs.getClothingSizeId(),
                cs.getClothing().getClothingId(),
                cs.getSize(),
                cs.getStock()
        );
    }
}