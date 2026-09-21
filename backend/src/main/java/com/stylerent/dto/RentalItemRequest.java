package com.stylerent.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RentalItemRequest(
        @NotNull(message = "Clothing item is required")
        Long clothingId,

        @NotBlank(message = "Size is required")
        @Size(max = 20, message = "Size must be at most 20 characters")
        String size,

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity
) {
}