package com.stylerent.controller;

import com.stylerent.dto.ApiResponse;
import com.stylerent.dto.ClothingRequest;
import com.stylerent.dto.ClothingResponse;
import com.stylerent.dto.HostDashboardResponse;
import com.stylerent.dto.RentalResponse;
import com.stylerent.service.ClothingService;
import com.stylerent.service.HostService;
import com.stylerent.service.RentalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/host")
@PreAuthorize("hasAnyRole('HOST', 'ADMIN')")
@Tag(name = "Host", description = "Host inventory and rental management")
public class HostController {

    private final HostService hostService;
    private final ClothingService clothingService;
    private final RentalService rentalService;

    public HostController(HostService hostService,
                          ClothingService clothingService,
                          RentalService rentalService) {
        this.hostService = hostService;
        this.clothingService = clothingService;
        this.rentalService = rentalService;
    }

    @GetMapping("/dashboard")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Host dashboard statistics")
    public ResponseEntity<ApiResponse<HostDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok("Host dashboard data", hostService.dashboard()));
    }

    @GetMapping("/clothing")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "List the host's own clothing")
    public ResponseEntity<ApiResponse<List<ClothingResponse>>> clothing() {
        return ResponseEntity.ok(ApiResponse.ok("Host clothing retrieved", clothingService.listByHost()));
    }

    @GetMapping("/rentals")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "List rentals that include the host's clothing")
    public ResponseEntity<ApiResponse<List<RentalResponse>>> rentals() {
        return ResponseEntity.ok(ApiResponse.ok("Host rentals retrieved", rentalService.listByHost()));
    }

    @GetMapping("/revenue")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Host total revenue (spec: GET /api/host/revenue)")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> revenue() {
        return ResponseEntity.ok(ApiResponse.ok("Host revenue retrieved",
                Map.of("totalRevenue", hostService.revenue())));
    }

    @PostMapping("/clothing")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Add clothing as host (spec: POST /api/host/clothing)")
    public ResponseEntity<ApiResponse<ClothingResponse>> addClothing(@Valid @RequestBody ClothingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Clothing created", clothingService.create(request)));
    }

    @PutMapping("/clothing/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update own clothing (spec: PUT /api/host/clothing/{id})")
    public ResponseEntity<ApiResponse<ClothingResponse>> updateClothing(@PathVariable Long id,
                                                                        @Valid @RequestBody ClothingRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Clothing updated", clothingService.update(id, request)));
    }

    @DeleteMapping("/clothing/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete own clothing (spec: DELETE /api/host/clothing/{id})")
    public ResponseEntity<ApiResponse<Void>> deleteClothing(@PathVariable Long id) {
        clothingService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Clothing deleted"));
    }
}