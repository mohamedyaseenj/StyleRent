package com.stylerent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RentalStatusRequest(
        @NotBlank(message = "Status is required")
        @Pattern(regexp = "Pending|Confirmed|Active|Completed|Cancelled",
                message = "Status must be one of Pending, Confirmed, Active, Completed, Cancelled")
        String status
) {
}