package com.stylerent.controller;

import com.stylerent.dto.ApiResponse;
import com.stylerent.dto.PaymentRequest;
import com.stylerent.dto.PaymentResponse;
import com.stylerent.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Demo payment processing (no card/PIN data stored)")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @Operation(summary = "Create a demo payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> create(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Payment recorded", paymentService.create(request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Payment retrieved", paymentService.getById(id)));
    }

    @GetMapping("/rental/{rentalId}")
    @Operation(summary = "List payments for a rental")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> listByRental(@PathVariable Long rentalId) {
        return ResponseEntity.ok(ApiResponse.ok("Payments retrieved", paymentService.listByRental(rentalId)));
    }
}