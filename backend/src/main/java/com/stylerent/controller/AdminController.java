package com.stylerent.controller;

import com.stylerent.dto.AdminDashboardResponse;
import com.stylerent.dto.ApiResponse;
import com.stylerent.dto.CategoryResponse;
import com.stylerent.dto.ClothingResponse;
import com.stylerent.dto.PaymentResponse;
import com.stylerent.dto.RentalResponse;
import com.stylerent.dto.ReviewResponse;
import com.stylerent.dto.UserResponse;
import com.stylerent.service.AdminService;
import com.stylerent.service.CategoryService;
import com.stylerent.service.ClothingService;
import com.stylerent.service.PaymentService;
import com.stylerent.service.RentalService;
import com.stylerent.service.ReviewService;
import com.stylerent.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Administrator dashboard and management")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;
    private final ClothingService clothingService;
    private final RentalService rentalService;
    private final ReviewService reviewService;
    private final CategoryService categoryService;
    private final PaymentService paymentService;

    public AdminController(AdminService adminService,
                           UserService userService,
                           ClothingService clothingService,
                           RentalService rentalService,
                           ReviewService reviewService,
                           CategoryService categoryService,
                           PaymentService paymentService) {
        this.adminService = adminService;
        this.userService = userService;
        this.clothingService = clothingService;
        this.rentalService = rentalService;
        this.reviewService = reviewService;
        this.categoryService = categoryService;
        this.paymentService = paymentService;
    }

    @GetMapping("/dashboard")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Admin dashboard statistics")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok("Admin dashboard data", adminService.dashboard()));
    }

    @GetMapping("/users")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "List all users (admin)")
    public ResponseEntity<ApiResponse<List<UserResponse>>> users() {
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved", userService.listAll()));
    }

    @GetMapping("/users/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get a single user (admin)")
    public ResponseEntity<ApiResponse<UserResponse>> user(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("User retrieved", userService.getById(id)));
    }

    @GetMapping("/clothing")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "List all clothing (admin)")
    public ResponseEntity<ApiResponse<List<ClothingResponse>>> clothing() {
        return ResponseEntity.ok(ApiResponse.ok("Clothing retrieved", clothingService.list(null, null, null, null, null)));
    }

    @GetMapping("/clothing/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get a single clothing item (admin)")
    public ResponseEntity<ApiResponse<ClothingResponse>> clothingById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Clothing retrieved", clothingService.getById(id)));
    }

    @GetMapping("/rentals")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "List all rentals (admin)")
    public ResponseEntity<ApiResponse<List<RentalResponse>>> rentals() {
        return ResponseEntity.ok(ApiResponse.ok("Rentals retrieved", rentalService.listAll()));
    }

    @GetMapping("/reviews")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "List all reviews (admin)")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> reviews() {
        return ResponseEntity.ok(ApiResponse.ok("Reviews retrieved", reviewService.listAll()));
    }

    @GetMapping("/categories")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "List all categories (admin)")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> categories() {
        return ResponseEntity.ok(ApiResponse.ok("Categories retrieved", categoryService.list()));
    }

    @GetMapping("/hosts")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "List all hosts (spec: GET /api/admin/hosts)")
    public ResponseEntity<ApiResponse<List<UserResponse>>> hosts() {
        return ResponseEntity.ok(ApiResponse.ok("Hosts retrieved", userService.listByRole("HOST")));
    }

    @GetMapping("/payments")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "List all payments (spec: GET /api/admin/payments)")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> payments() {
        return ResponseEntity.ok(ApiResponse.ok("Payments retrieved", paymentService.listAll()));
    }

    @PutMapping("/users/{id}/status")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Activate/deactivate a user (admin)")
    public ResponseEntity<ApiResponse<UserResponse>> setUserStatus(@PathVariable Long id,
                                                                   @RequestParam boolean active) {
        return ResponseEntity.ok(ApiResponse.ok(active ? "User activated" : "User deactivated",
                userService.setActive(id, active)));
    }
}