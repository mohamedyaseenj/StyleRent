package com.stylerent.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record ClothingRequest(
        @NotNull(message = "Category is required")
        Long categoryId,

        Long hostId,

        @NotBlank(message = "Name is required")
        @Size(max = 150, message = "Name must be at most 150 characters")
        String name,

        String description,

        @NotNull(message = "Price per day is required")
        @DecimalMin(value = "0.01", message = "Price per day must be greater than 0")
        BigDecimal pricePerDay,

        @NotNull(message = "1 day price is required")
        @DecimalMin(value = "0.01", message = "1 day price must be greater than 0")
        BigDecimal price1Day,

        @NotNull(message = "2 day price is required")
        @DecimalMin(value = "0.01", message = "2 day price must be greater than 0")
        BigDecimal price2Day,

        @NotNull(message = "3 day price is required")
        @DecimalMin(value = "0.01", message = "3 day price must be greater than 0")
        BigDecimal price3Day,

        @NotNull(message = "1 week price is required")
        @DecimalMin(value = "0.01", message = "1 week price must be greater than 0")
        BigDecimal price1Week,

        @Size(max = 500, message = "Image URL must be at most 500 characters")
        String imageUrl,

        @Size(max = 60, message = "Color must be at most 60 characters")
        String color,

        @NotNull(message = "Stock is required")
        @Min(value = 0, message = "Stock cannot be negative")
        Integer stock,

        @Pattern(regexp = "MEN|WOMEN|KIDS", message = "Gender must be one of MEN, WOMEN, KIDS")
        String gender,

        Boolean active,

        List<@Valid ClothingSizeRequest> sizes
) {
}