package com.stylerent.service;

import com.stylerent.dto.HostDashboardResponse;
import com.stylerent.entity.Rental;
import com.stylerent.entity.RentalItem;
import com.stylerent.entity.User;
import com.stylerent.repository.ClothingRepository;
import com.stylerent.repository.RentalItemRepository;
import com.stylerent.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class HostService {

    private static final List<String> REVENUE_STATUSES = List.of("Confirmed", "Active", "Completed");

    private final RentalItemRepository rentalItemRepository;
    private final ClothingRepository clothingRepository;
    private final SecurityUtils securityUtils;

    public HostService(RentalItemRepository rentalItemRepository,
                       ClothingRepository clothingRepository,
                       SecurityUtils securityUtils) {
        this.rentalItemRepository = rentalItemRepository;
        this.clothingRepository = clothingRepository;
        this.securityUtils = securityUtils;
    }

    @Transactional(readOnly = true)
    public HostDashboardResponse dashboard() {
        User host = securityUtils.currentUser();
        List<RentalItem> hostItems = rentalItemRepository.findByClothing_Host_UserIdOrderByRentalItemIdAsc(host.getUserId());

        Map<Long, Rental> rentalsById = new LinkedHashMap<>();
        BigDecimal revenue = BigDecimal.ZERO;
        for (RentalItem item : hostItems) {
            Rental rental = item.getRental();
            rentalsById.putIfAbsent(rental.getRentalId(), rental);
            if (REVENUE_STATUSES.contains(rental.getStatus())) {
                revenue = revenue.add(item.getSubtotal());
            }
        }
        List<Rental> rentals = rentalsById.values().stream()
                .sorted(Comparator.comparing(Rental::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        long activeRentals = rentals.stream().filter(r -> "Active".equals(r.getStatus())).count();
        long pendingRentals = rentals.stream().filter(r -> "Pending".equals(r.getStatus())).count();

        long availableStock = clothingRepository.findByHost_UserId(host.getUserId()).stream()
                .mapToLong(c -> c.getStock() == null ? 0L : c.getStock())
                .sum();

        return new HostDashboardResponse(
                clothingRepository.countByHost_UserId(host.getUserId()),
                rentals.size(),
                revenue,
                activeRentals,
                pendingRentals,
                availableStock
        );
    }

    @Transactional(readOnly = true)
    public java.math.BigDecimal revenue() {
        return dashboard().totalRevenue();
    }
}