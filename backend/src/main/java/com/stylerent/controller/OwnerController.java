package com.stylerent.controller;

import com.stylerent.dto.ApiResponse;
import com.stylerent.dto.OwnerDashboardResponse;
import com.stylerent.service.OwnerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/owner")
@PreAuthorize("hasRole('OWNER')")
@Tag(name = "Owner", description = "Owner inventory dashboard")
public class OwnerController {

    private final OwnerService ownerService;

    public OwnerController(OwnerService ownerService) {
        this.ownerService = ownerService;
    }

    @GetMapping("/dashboard")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Owner dashboard statistics")
    public ResponseEntity<ApiResponse<OwnerDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok("Owner dashboard data", ownerService.dashboard()));
    }
}