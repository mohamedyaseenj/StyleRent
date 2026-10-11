package com.stylerent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RoleUpdateRequest(
        @NotBlank(message = "Role is required")
        @Pattern(regexp = "USER|HOST|ADMIN", message = "Role must be one of USER, HOST, ADMIN")
        String role
) {
}