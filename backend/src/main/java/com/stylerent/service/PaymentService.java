package com.stylerent.service;

import com.stylerent.dto.PaymentRequest;
import com.stylerent.dto.PaymentResponse;
import com.stylerent.entity.Payment;
import com.stylerent.entity.Rental;
import com.stylerent.entity.User;
import com.stylerent.exception.BadRequestException;
import com.stylerent.exception.ResourceNotFoundException;
import com.stylerent.exception.UnauthorizedException;
import com.stylerent.repository.PaymentRepository;
import com.stylerent.repository.RentalRepository;
import com.stylerent.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RentalRepository rentalRepository;
    private final SecurityUtils securityUtils;

    public PaymentService(PaymentRepository paymentRepository,
                          RentalRepository rentalRepository,
                          SecurityUtils securityUtils) {
        this.paymentRepository = paymentRepository;
        this.rentalRepository = rentalRepository;
        this.securityUtils = securityUtils;
    }

    /**
     * Demo payment: only method + status + transaction id are stored. Card
     * numbers, CVV, bank passwords and UPI PINs are never accepted or stored.
     */
    @Transactional
    public PaymentResponse create(PaymentRequest request) {
        User user = securityUtils.currentUser();
        Rental rental = rentalRepository.findById(request.rentalId())
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + request.rentalId()));

        boolean owner = rental.getUser().getUserId().equals(user.getUserId());
        boolean manager = "ADMIN".equals(user.getRole()) || "HOST".equals(user.getRole());
        if (!owner && !manager) {
            throw new UnauthorizedException("You do not have access to this rental");
        }
        if (paymentRepository.findByRental_RentalIdOrderByPaymentDateDesc(request.rentalId()).stream()
                .anyMatch(p -> "Paid".equals(p.getPaymentStatus()))) {
            throw new BadRequestException("This rental has already been paid");
        }

        if (request.amount() == null || request.amount().compareTo(rental.getTotalAmount()) != 0) {
            throw new BadRequestException("Payment amount must equal the rental total of " + rental.getTotalAmount());
        }

        Payment payment = new Payment();
        payment.setRental(rental);
        payment.setAmount(request.amount());
        payment.setPaymentMethod(request.paymentMethod());
        payment.setPaymentStatus("Paid");
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase());
        return PaymentResponse.from(paymentRepository.save(payment));
    }

    @Transactional(readOnly = true)
    public PaymentResponse getById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        requireAccess(payment);
        return PaymentResponse.from(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> listByRental(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + rentalId));
        User user = securityUtils.currentUser();
        boolean owner = rental.getUser().getUserId().equals(user.getUserId());
        boolean manager = "ADMIN".equals(user.getRole()) || "HOST".equals(user.getRole());
        if (!owner && !manager) {
            throw new UnauthorizedException("You do not have access to this rental");
        }
        return paymentRepository.findByRental_RentalIdOrderByPaymentDateDesc(rentalId).stream()
                .map(PaymentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> listAll() {
        return paymentRepository.findAll().stream()
                .map(PaymentResponse::from)
                .toList();
    }

    private void requireAccess(Payment payment) {
        User user = securityUtils.currentUser();
        boolean owner = payment.getRental().getUser().getUserId().equals(user.getUserId());
        boolean manager = "ADMIN".equals(user.getRole()) || "HOST".equals(user.getRole());
        if (!owner && !manager) {
            throw new UnauthorizedException("You do not have access to this payment");
        }
    }
}