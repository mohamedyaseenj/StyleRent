package com.stylerent.dto;

import java.math.BigDecimal;
import java.util.Map;

public record AdminDashboardResponse(
        long totalUsers,
        long totalClothing,
        long totalRentals,
        BigDecimal totalRevenue,
        long pendingRentals,
        long totalPayments,
        long totalReviews,
        Map<String, Long> rentalsByStatus,
        Map<String, Long> usersByRole
) {
}