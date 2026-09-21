package com.stylerent.dto;

import com.stylerent.entity.Rental;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record RentalResponse(
        Long id,
        Long userId,
        String userName,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalAmount,
        String status,
        LocalDateTime createdAt,
        List<RentalItemResponse> items
) {

    public static RentalResponse of(Rental rental, String userName, List<RentalItemResponse> items) {
        return new RentalResponse(
                rental.getRentalId(),
                rental.getUser().getUserId(),
                userName,
                rental.getStartDate(),
                rental.getEndDate(),
                rental.getTotalAmount(),
                rental.getStatus(),
                rental.getCreatedAt(),
                items
        );
    }
}