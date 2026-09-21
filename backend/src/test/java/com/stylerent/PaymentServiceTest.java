package com.stylerent;

import com.stylerent.dto.PaymentRequest;
import com.stylerent.dto.PaymentResponse;
import com.stylerent.entity.Payment;
import com.stylerent.entity.Rental;
import com.stylerent.entity.User;
import com.stylerent.exception.BadRequestException;
import com.stylerent.repository.PaymentRepository;
import com.stylerent.repository.RentalRepository;
import com.stylerent.security.SecurityUtils;
import com.stylerent.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private RentalRepository rentalRepository;
    @Mock
    private SecurityUtils securityUtils;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(paymentRepository, rentalRepository, securityUtils);
    }

    private Rental sampleRental() {
        User user = new User("Aarav", "a@b.com", "h", null, null, "USER");
        user.setUserId(1L);
        Rental rental = new Rental();
        rental.setRentalId(10L);
        rental.setUser(user);
        rental.setTotalAmount(new BigDecimal("6600.00"));
        return rental;
    }

    @Test
    void createStoresOnlyMethodStatusAndTransactionId() {
        when(securityUtils.currentUser()).thenReturn(sampleRental().getUser());
        when(rentalRepository.findById(10L)).thenReturn(Optional.of(sampleRental()));
        when(paymentRepository.findByRental_RentalIdOrderByPaymentDateDesc(10L)).thenReturn(List.of());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setPaymentId(1L);
            return p;
        });

        PaymentResponse response =
                paymentService.create(new PaymentRequest(10L, new BigDecimal("6600.00"), "UPI"));

        assertThat(response.paymentStatus()).isEqualTo("Paid");
        assertThat(response.paymentMethod()).isEqualTo("UPI");
        assertThat(response.transactionId()).startsWith("TXN-");
    }

    @Test
    void duplicatePaidRentalIsRejected() {
        Payment existing = new Payment();
        existing.setPaymentStatus("Paid");

        when(securityUtils.currentUser()).thenReturn(sampleRental().getUser());
        when(rentalRepository.findById(10L)).thenReturn(Optional.of(sampleRental()));
        when(paymentRepository.findByRental_RentalIdOrderByPaymentDateDesc(10L)).thenReturn(List.of(existing));

        assertThatThrownBy(() -> paymentService.create(
                new PaymentRequest(10L, new BigDecimal("6600.00"), "Card")))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already been paid");
    }
}