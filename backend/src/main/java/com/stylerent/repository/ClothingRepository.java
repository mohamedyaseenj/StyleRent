package com.stylerent.repository;

import com.stylerent.entity.Clothing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;

public interface ClothingRepository extends JpaRepository<Clothing, Long> {

    List<Clothing> findByNameContainingIgnoreCase(String name);

    List<Clothing> findByCategory_CategoryId(Long categoryId);

    List<Clothing> findByColorIgnoreCase(String color);

    List<Clothing> findByPricePerDayBetween(BigDecimal minPrice, BigDecimal maxPrice);

    List<Clothing> findByHost_UserId(Long hostId);

    long countByHost_UserId(Long hostId);

    List<Clothing> findAllByOrderByCreatedAtDesc();
}