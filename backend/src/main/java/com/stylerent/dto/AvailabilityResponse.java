package com.stylerent.dto;

public record AvailabilityResponse(
        boolean available,
        int availableStock,
        int requestedQuantity,
        String message
) {
}