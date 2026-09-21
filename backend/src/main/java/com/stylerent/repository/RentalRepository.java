package com.stylerent.repository;

import com.stylerent.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Long> {

    List<Rental> findByUser_UserIdOrderByCreatedAtDesc(Long userId);

    List<Rental> findByStatus(String status);

    List<Rental> findAllByOrderByCreatedAtDesc();
}