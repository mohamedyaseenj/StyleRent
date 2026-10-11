package com.stylerent.controller;

import com.stylerent.dto.ApiResponse;
import com.stylerent.dto.AvailabilityResponse;
import com.stylerent.dto.ClothingRequest;
import com.stylerent.dto.ClothingResponse;
import com.stylerent.dto.ClothingSizeResponse;
import com.stylerent.service.ClothingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/clothing")
@Tag(name = "Clothing", description = "Clothing catalog, sizes and availability")
public class ClothingController {

    private final ClothingService clothingService;

    public ClothingController(ClothingService clothingService) {
        this.clothingService = clothingService;
    }

    @GetMapping
    @Operation(summary = "List clothing with optional filters (public)")
    public ResponseEntity<ApiResponse<List<ClothingResponse>>> list(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        return ResponseEntity.ok(ApiResponse.ok("Clothing retrieved",
                clothingService.list(name, category, color, minPrice, maxPrice)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search clothing by name (public)")
    public ResponseEntity<ApiResponse<List<ClothingResponse>>> search(@RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.ok("Search results", clothingService.list(name, null, null, null, null)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single clothing item with its sizes (public)")
    public ResponseEntity<ApiResponse<ClothingResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Clothing retrieved", clothingService.getById(id)));
    }

    @GetMapping("/{id}/sizes")
    @Operation(summary = "Get sizes with stock for a clothing item (public)")
    public ResponseEntity<ApiResponse<List<ClothingSizeResponse>>> getSizes(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Sizes retrieved", clothingService.getSizes(id)));
    }

    @GetMapping("/{id}/availability")
    @Operation(summary = "Check size availability for a date window (public)")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> availability(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam String size,
            @RequestParam(defaultValue = "1") int requestedQuantity) {
        return ResponseEntity.ok(ApiResponse.ok("Availability checked",
                clothingService.checkAvailability(id, startDate, endDate, size, requestedQuantity)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HOST')")
    @Operation(summary = "Create a clothing item (admin/host only)")
    public ResponseEntity<ApiResponse<ClothingResponse>> create(@Valid @RequestBody ClothingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Clothing created", clothingService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HOST')")
    @Operation(summary = "Update a clothing item (admin/host only)")
    public ResponseEntity<ApiResponse<ClothingResponse>> update(@PathVariable Long id,
                                                                @Valid @RequestBody ClothingRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Clothing updated", clothingService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HOST')")
    @Operation(summary = "Delete a clothing item (admin/host only)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        clothingService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Clothing deleted"));
    }
}