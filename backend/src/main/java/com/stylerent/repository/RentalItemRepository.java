package com.stylerent.repository;

import com.stylerent.entity.RentalItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RentalItemRepository extends JpaRepository<RentalItem, Long> {

    List<RentalItem> findByRental_RentalId(Long rentalId);

    List<RentalItem> findByRental_RentalIdOrderByRentalItemIdAsc(Long rentalId);

    /**
     * Finds rental items for the given clothing that overlap the requested
     * date window for rentals still occupying stock (Pending / Confirmed / Active).
     * Overlap rule: existing.start &lt; requested.end AND existing.end &gt; requested.start.
     */
    @Query("SELECT ri FROM RentalItem ri WHERE ri.clothing.id = :clothingId " +
            "AND ri.rental.status IN ('Pending', 'Confirmed', 'Active') " +
            "AND ri.rental.startDate < :endDate AND ri.rental.endDate > :startDate")
    List<RentalItem> findOverlappingActiveItems(
            @Param("clothingId") Long clothingId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}