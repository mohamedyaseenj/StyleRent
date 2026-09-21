package com.stylerent.repository;

import com.stylerent.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByRental_RentalIdOrderByPaymentDateDesc(Long rentalId);

    Optional<Payment> findByTransactionId(String transactionId);
}