package com.stylerent.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record PaymentRequest(
        @NotNull(message = "Rental is required")
        Long rentalId,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        BigDecimal amount,

        @NotBlank(message = "Payment method is required")
        @Pattern(regexp = "UPI|Card|Cash", message = "Payment method must be UPI, Card or Cash")
        String paymentMethod
) {
}