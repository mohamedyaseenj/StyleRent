package com.stylerent.service;

import com.stylerent.dto.OwnerDashboardResponse;
import com.stylerent.entity.Rental;
import com.stylerent.repository.ClothingRepository;
import com.stylerent.repository.RentalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OwnerService {

    private final RentalRepository rentalRepository;
    private final ClothingRepository clothingRepository;

    public OwnerService(RentalRepository rentalRepository,
                        ClothingRepository clothingRepository) {
        this.rentalRepository = rentalRepository;
        this.clothingRepository = clothingRepository;
    }

    @Transactional(readOnly = true)
    public OwnerDashboardResponse dashboard() {
        List<Rental> rentals = rentalRepository.findAll();
        long activeRentals = rentals.stream().filter(r -> "Active".equals(r.getStatus())).count();
        long pendingRentals = rentals.stream().filter(r -> "Pending".equals(r.getStatus())).count();
        BigDecimal totalRevenue = rentals.stream()
                .filter(r -> List.of("Confirmed", "Active", "Completed").contains(r.getStatus()))
                .map(Rental::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long availableStock = clothingRepository.findAll().stream()
                .mapToLong(c -> c.getStock() == null ? 0L : c.getStock())
                .sum();

        return new OwnerDashboardResponse(
                clothingRepository.count(),
                rentals.size(),
                totalRevenue,
                activeRentals,
                pendingRentals,
                availableStock
        );
    }
}