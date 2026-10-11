package com.stylerent.dto;

import java.math.BigDecimal;

public record HostDashboardResponse(
        long totalClothing,
        long totalRentals,
        BigDecimal totalRevenue,
        long activeRentals,
        long pendingRentals,
        long totalAvailableStock
) {
}