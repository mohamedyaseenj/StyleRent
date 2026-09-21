package com.stylerent.controller;

import com.stylerent.dto.ApiResponse;
import com.stylerent.dto.RentalRequest;
import com.stylerent.dto.RentalResponse;
import com.stylerent.dto.RentalStatusRequest;
import com.stylerent.service.RentalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@Tag(name = "Rentals", description = "Rental booking lifecycle")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @PostMapping
    @Operation(summary = "Create a rental (authenticated user)")
    public ResponseEntity<ApiResponse<RentalResponse>> create(@Valid @RequestBody RentalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Rental created", rentalService.create(request)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get the current user's rentals")
    public ResponseEntity<ApiResponse<List<RentalResponse>>> my() {
        return ResponseEntity.ok(ApiResponse.ok("Rentals retrieved", rentalService.myRentals()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single rental")
    public ResponseEntity<ApiResponse<RentalResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Rental retrieved", rentalService.getById(id)));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List a user's rentals (admin only)")
    public ResponseEntity<ApiResponse<List<RentalResponse>>> listByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Rentals retrieved", rentalService.listByUser(userId)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @Operation(summary = "Update a rental status (admin/owner only)")
    public ResponseEntity<ApiResponse<RentalResponse>> updateStatus(@PathVariable Long id,
                                                                    @Valid @RequestBody RentalStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Rental status updated",
                rentalService.updateStatus(id, request.status())));
    }

    @PostMapping("/{id}/items")
    @Operation(summary = "Add items to an existing rental")
    public ResponseEntity<ApiResponse<RentalResponse>> addItems(@PathVariable Long id,
                                                                @Valid @RequestBody RentalRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Items added", rentalService.addItems(id, request)));
    }
}