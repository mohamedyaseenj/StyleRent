package com.stylerent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 120, message = "Name must be at most 120 characters")
        String name,

        @Size(max = 20, message = "Phone must be at most 20 characters")
        String phone,

        @Size(max = 255, message = "Address must be at most 255 characters")
        String address,

        @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
        String password
) {
}