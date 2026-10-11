package com.stylerent.service;

import com.stylerent.dto.RentalItemRequest;
import com.stylerent.dto.RentalItemResponse;
import com.stylerent.dto.RentalRequest;
import com.stylerent.dto.RentalResponse;
import com.stylerent.entity.Clothing;
import com.stylerent.entity.ClothingSize;
import com.stylerent.entity.Rental;
import com.stylerent.entity.RentalItem;
import com.stylerent.entity.User;
import com.stylerent.exception.BadRequestException;
import com.stylerent.exception.ResourceNotFoundException;
import com.stylerent.exception.UnauthorizedException;
import com.stylerent.repository.ClothingRepository;
import com.stylerent.repository.ClothingSizeRepository;
import com.stylerent.repository.RentalItemRepository;
import com.stylerent.repository.RentalRepository;
import com.stylerent.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class RentalService {

    private static final List<String> CANCELLABLE_STATUSES = List.of("Pending", "Confirmed");

    private final RentalRepository rentalRepository;
    private final RentalItemRepository rentalItemRepository;
    private final ClothingRepository clothingRepository;
    private final ClothingSizeRepository clothingSizeRepository;
    private final SecurityUtils securityUtils;

    public RentalService(RentalRepository rentalRepository,
                         RentalItemRepository rentalItemRepository,
                         ClothingRepository clothingRepository,
                         ClothingSizeRepository clothingSizeRepository,
                         SecurityUtils securityUtils) {
        this.rentalRepository = rentalRepository;
        this.rentalItemRepository = rentalItemRepository;
        this.clothingRepository = clothingRepository;
        this.clothingSizeRepository = clothingSizeRepository;
        this.securityUtils = securityUtils;
    }

    @Transactional
    public RentalResponse create(RentalRequest request) {
        User user = securityUtils.currentUser();
        int rentalDays = validateDates(request.startDate(), request.endDate());

        List<PreparedItem> prepared = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (RentalItemRequest itemRequest : request.items()) {
            PreparedItem item = prepare(itemRequest, request.startDate(), request.endDate(), rentalDays);
            prepared.add(item);
            total = total.add(item.subtotal());
        }

        Rental rental = new Rental();
        rental.setUser(user);
        rental.setStartDate(request.startDate());
        rental.setEndDate(request.endDate());
        rental.setTotalAmount(total);
        rental.setStatus("Pending");
        Rental savedRental = rentalRepository.save(rental);

        for (PreparedItem item : prepared) {
            RentalItem rentalItem = new RentalItem();
            rentalItem.setRental(savedRental);
            rentalItem.setClothing(item.clothing());
            rentalItem.setSize(item.size());
            rentalItem.setQuantity(item.quantity());
            rentalItem.setPricePerDay(item.rate());
            rentalItem.setRentalDays(rentalDays);
            rentalItem.setSubtotal(item.subtotal());
            rentalItemRepository.save(rentalItem);

            decrementStock(item);
        }

        return toResponse(savedRental);
    }

    @Transactional
    public RentalResponse addItems(Long rentalId, RentalRequest request) {
        Rental rental = findRental(rentalId);
        requireAccess(rental);

        int rentalDays = validateDates(request.startDate(), request.endDate());
        if (!request.startDate().equals(rental.getStartDate()) || !request.endDate().equals(rental.getEndDate())) {
            throw new BadRequestException("Items can only be added to the rental on its existing dates");
        }

        BigDecimal added = BigDecimal.ZERO;
        for (RentalItemRequest itemRequest : request.items()) {
            PreparedItem item = prepare(itemRequest, request.startDate(), request.endDate(), rentalDays);
            RentalItem rentalItem = new RentalItem();
            rentalItem.setRental(rental);
            rentalItem.setClothing(item.clothing());
            rentalItem.setSize(item.size());
            rentalItem.setQuantity(item.quantity());
            rentalItem.setPricePerDay(item.rate());
            rentalItem.setRentalDays(rentalDays);
            rentalItem.setSubtotal(item.subtotal());
            rentalItemRepository.save(rentalItem);
            decrementStock(item);
            added = added.add(item.subtotal());
        }

        rental.setTotalAmount(rental.getTotalAmount().add(added));
        return toResponse(rentalRepository.save(rental));
    }

    @Transactional
    public RentalResponse cancel(Long id) {
        Rental rental = findRental(id);
        User user = securityUtils.currentUser();
        boolean owner = rental.getUser().getUserId().equals(user.getUserId());
        boolean admin = "ADMIN".equals(user.getRole());
        if (!owner && !admin) {
            throw new UnauthorizedException("You can only cancel your own rentals");
        }
        if (!CANCELLABLE_STATUSES.contains(rental.getStatus())) {
            throw new BadRequestException("Only Pending or Confirmed rentals can be cancelled");
        }
        rental.setStatus("Cancelled");
        restoreStock(rental);
        return toResponse(rentalRepository.save(rental));
    }

    @Transactional(readOnly = true)
    public RentalResponse getById(Long id) {
        Rental rental = findRental(id);
        requireAccess(rental);
        return toResponse(rental);
    }

    @Transactional(readOnly = true)
    public List<RentalResponse> myRentals() {
        Long userId = securityUtils.currentUserId();
        return rentalRepository.findByUser_UserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RentalResponse> listByUser(Long userId) {
        return rentalRepository.findByUser_UserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RentalResponse> listByHost() {
        Long hostId = securityUtils.currentUserId();
        Set<Long> rentalIds = new LinkedHashSet<>();
        rentalItemRepository.findByClothing_Host_UserIdOrderByRentalItemIdAsc(hostId)
                .forEach(item -> rentalIds.add(item.getRental().getRentalId()));
        return rentalIds.stream()
                .map(rentalRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .sorted(Comparator.comparing(Rental::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RentalResponse> listAll() {
        return rentalRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RentalResponse updateStatus(Long id, String status) {
        Rental rental = findRental(id);
        if (!List.of("Pending", "Confirmed", "Active", "Completed", "Cancelled").contains(status)) {
            throw new BadRequestException("Invalid rental status: " + status);
        }
        rental.setStatus(status);
        return toResponse(rentalRepository.save(rental));
    }

    private PreparedItem prepare(RentalItemRequest itemRequest, LocalDate startDate, LocalDate endDate,
                                 int rentalDays) {
        Clothing clothing = clothingRepository.findById(itemRequest.clothingId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Clothing not found with id: " + itemRequest.clothingId()));

        ClothingSize sizeRow = clothingSizeRepository.findByClothing_ClothingIdAndSize(
                        clothing.getClothingId(), itemRequest.size())
                .orElse(null);

        int reserved = reservedQuantity(clothing.getClothingId(), startDate, endDate);
        int clothingAvailable = Math.max(0, clothing.getStock() - reserved);
        int sizeAvailable = sizeRow == null ? 0 : Math.max(0, sizeRow.getStock() - reserved);
        int available = Math.min(clothingAvailable, sizeAvailable);

        if (sizeRow == null) {
            throw new BadRequestException(
                    "Size '" + itemRequest.size() + "' is not available for item: " + clothing.getName());
        }
        if (available < itemRequest.quantity()) {
            throw new BadRequestException(
                    "Insufficient stock for " + clothing.getName()
                            + " (size " + itemRequest.size() + ") on the selected dates. Available: " + available);
        }

        BigDecimal rate = tierRate(clothing, rentalDays);
        BigDecimal subtotal = rate.multiply(BigDecimal.valueOf(itemRequest.quantity()));
        return new PreparedItem(clothing, itemRequest.size(), itemRequest.quantity(), rate, subtotal, reserved);
    }

    /**
     * Tiered rental pricing. The host defines a flat rate for 1/2/3-day and
     * 1-week windows (price_1_day, price_2_day, price_3_day, price_1_week).
     * 4..6 day bookings fall back to the per-day base rate &times; days.
     */
    private BigDecimal tierRate(Clothing clothing, int rentalDays) {
        return switch (rentalDays) {
            case 1 -> clothing.getPrice1Day();
            case 2 -> clothing.getPrice2Day();
            case 3 -> clothing.getPrice3Day();
            default -> rentalDays >= 7
                    ? clothing.getPrice1Week()
                    : clothing.getPricePerDay().multiply(BigDecimal.valueOf(rentalDays));
        };
    }

    private void decrementStock(PreparedItem item) {
        Clothing clothing = item.clothing();
        int newClothingStock = Math.max(0, clothing.getStock() - item.quantity());
        clothing.setStock(newClothingStock);
        clothingRepository.save(clothing);

        clothingSizeRepository.findByClothing_ClothingIdAndSize(clothing.getClothingId(), item.size())
                .ifPresent(sizeRow -> {
                    int newSizeStock = Math.max(0, sizeRow.getStock() - item.quantity());
                    sizeRow.setStock(newSizeStock);
                    clothingSizeRepository.save(sizeRow);
                });
    }

    private void restoreStock(Rental rental) {
        for (RentalItem item : rentalItemRepository.findByRental_RentalId(rental.getRentalId())) {
            Clothing clothing = item.getClothing();
            clothing.setStock(clothing.getStock() + item.getQuantity());
            clothingRepository.save(clothing);
            if (item.getSize() != null) {
                clothingSizeRepository.findByClothing_ClothingIdAndSize(clothing.getClothingId(), item.getSize())
                        .ifPresent(sizeRow -> {
                            sizeRow.setStock(sizeRow.getStock() + item.getQuantity());
                            clothingSizeRepository.save(sizeRow);
                        });
            }
        }
    }

    private int reservedQuantity(Long clothingId, LocalDate startDate, LocalDate endDate) {
        return rentalItemRepository.findOverlappingActiveItems(clothingId, startDate, endDate).stream()
                .mapToInt(RentalItem::getQuantity)
                .sum();
    }

    private int validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new BadRequestException("startDate and endDate are required");
        }
        if (!endDate.isAfter(startDate)) {
            throw new BadRequestException("endDate must be after startDate");
        }
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        if (days <= 0) {
            throw new BadRequestException("Rental must be at least 1 day");
        }
        return (int) days;
    }

    private Rental findRental(Long id) {
        return rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + id));
    }

    private void requireAccess(Rental rental) {
        User user = securityUtils.currentUser();
        boolean owner = rental.getUser().getUserId().equals(user.getUserId());
        boolean manager = "ADMIN".equals(user.getRole()) || "HOST".equals(user.getRole());
        if (!owner && !manager) {
            throw new UnauthorizedException("You do not have access to this rental");
        }
    }

    private RentalResponse toResponse(Rental rental) {
        List<RentalItemResponse> items = rentalItemRepository.findByRental_RentalIdOrderByRentalItemIdAsc(rental.getRentalId())
                .stream()
                .map(item -> RentalItemResponse.from(item, item.getClothing().getName(), item.getSize()))
                .toList();
        return RentalResponse.of(rental, rental.getUser().getName(), items);
    }

    private record PreparedItem(Clothing clothing, String size, int quantity, BigDecimal rate,
                                BigDecimal subtotal, int reserved) {
    }
}