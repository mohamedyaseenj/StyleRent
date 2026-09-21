package com.stylerent.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ClothingSizeRequest(
        @NotBlank(message = "Size is required")
        @Size(max = 20, message = "Size must be at most 20 characters")
        String size,

        @NotNull(message = "Stock is required")
        @Min(value = 0, message = "Stock cannot be negative")
        Integer stock
) {
}