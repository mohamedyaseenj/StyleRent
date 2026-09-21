package com.stylerent.dto;

import com.stylerent.entity.RentalItem;

import java.math.BigDecimal;

public record RentalItemResponse(
        Long rentalItemId,
        Long clothingId,
        String clothingName,
        String size,
        Integer quantity,
        BigDecimal pricePerDay,
        Integer rentalDays,
        BigDecimal subtotal
) {

    public static RentalItemResponse from(RentalItem item, String clothingName, String size) {
        return new RentalItemResponse(
                item.getRentalItemId(),
                item.getClothing().getClothingId(),
                clothingName,
                size,
                item.getQuantity(),
                item.getPricePerDay(),
                item.getRentalDays(),
                item.getSubtotal()
        );
    }
}