package com.stylerent.dto;

import com.stylerent.entity.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        Long rentalId,
        BigDecimal amount,
        String paymentMethod,
        LocalDateTime paymentDate,
        String paymentStatus,
        String transactionId
) {

    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
                payment.getPaymentId(),
                payment.getRental().getRentalId(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getPaymentDate(),
                payment.getPaymentStatus(),
                payment.getTransactionId()
        );
    }
}