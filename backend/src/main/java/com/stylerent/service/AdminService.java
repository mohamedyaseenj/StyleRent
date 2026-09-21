package com.stylerent.service;

import com.stylerent.dto.AdminDashboardResponse;
import com.stylerent.entity.Rental;
import com.stylerent.entity.User;
import com.stylerent.repository.ClothingRepository;
import com.stylerent.repository.PaymentRepository;
import com.stylerent.repository.RentalRepository;
import com.stylerent.repository.ReviewRepository;
import com.stylerent.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ClothingRepository clothingRepository;
    private final RentalRepository rentalRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;

    public AdminService(UserRepository userRepository,
                        ClothingRepository clothingRepository,
                        RentalRepository rentalRepository,
                        PaymentRepository paymentRepository,
                        ReviewRepository reviewRepository) {
        this.userRepository = userRepository;
        this.clothingRepository = clothingRepository;
        this.rentalRepository = rentalRepository;
        this.paymentRepository = paymentRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse dashboard() {
        List<Rental> rentals = rentalRepository.findAll();
        List<User> users = userRepository.findAll();

        long pendingRentals = rentals.stream().filter(r -> "Pending".equals(r.getStatus())).count();
        BigDecimal totalRevenue = rentals.stream()
                .filter(r -> List.of("Confirmed", "Active", "Completed").contains(r.getStatus()))
                .map(Rental::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> rentalsByStatus = new LinkedHashMap<>();
        for (Rental r : rentals) {
            rentalsByStatus.merge(r.getStatus(), 1L, Long::sum);
        }

        Map<String, Long> usersByRole = new LinkedHashMap<>();
        for (User u : users) {
            usersByRole.merge(u.getRole(), 1L, Long::sum);
        }

        return new AdminDashboardResponse(
                users.size(),
                clothingRepository.count(),
                rentals.size(),
                totalRevenue,
                pendingRentals,
                paymentRepository.count(),
                reviewRepository.count(),
                rentalsByStatus,
                usersByRole
        );
    }
}