package com.stylerent.service;

import com.stylerent.dto.AvailabilityResponse;
import com.stylerent.dto.ClothingRequest;
import com.stylerent.dto.ClothingResponse;
import com.stylerent.dto.ClothingSizeRequest;
import com.stylerent.dto.ClothingSizeResponse;
import com.stylerent.entity.Category;
import com.stylerent.entity.Clothing;
import com.stylerent.entity.ClothingSize;
import com.stylerent.entity.RentalItem;
import com.stylerent.exception.BadRequestException;
import com.stylerent.exception.ResourceNotFoundException;
import com.stylerent.entity.User;
import com.stylerent.repository.CategoryRepository;
import com.stylerent.repository.ClothingRepository;
import com.stylerent.repository.ClothingSizeRepository;
import com.stylerent.repository.RentalItemRepository;
import com.stylerent.repository.UserRepository;
import com.stylerent.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
public class ClothingService {

    private final ClothingRepository clothingRepository;
    private final CategoryRepository categoryRepository;
    private final ClothingSizeRepository clothingSizeRepository;
    private final RentalItemRepository rentalItemRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    public ClothingService(ClothingRepository clothingRepository,
                           CategoryRepository categoryRepository,
                           ClothingSizeRepository clothingSizeRepository,
                           RentalItemRepository rentalItemRepository,
                           UserRepository userRepository,
                           SecurityUtils securityUtils) {
        this.clothingRepository = clothingRepository;
        this.categoryRepository = categoryRepository;
        this.clothingSizeRepository = clothingSizeRepository;
        this.rentalItemRepository = rentalItemRepository;
        this.userRepository = userRepository;
        this.securityUtils = securityUtils;
    }

    @Transactional(readOnly = true)
    public List<ClothingResponse> list(String name, String category, String color,
                                       BigDecimal minPrice, BigDecimal maxPrice) {
        List<Clothing> items = (name != null && !name.isBlank())
                ? clothingRepository.findByNameContainingIgnoreCase(name.trim())
                : clothingRepository.findAll();

        return items.stream()
                .filter(c -> categoryIsBlankOr(category, c))
                .filter(c -> colorIsBlankOr(color, c))
                .filter(c -> minPrice == null || c.getPricePerDay().compareTo(minPrice) >= 0)
                .filter(c -> maxPrice == null || c.getPricePerDay().compareTo(maxPrice) <= 0)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClothingResponse> listByColor(String color) {
        return clothingRepository.findByColorIgnoreCase(color).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClothingResponse> listByHost() {
        Long hostId = securityUtils.currentUserId();
        return clothingRepository.findByHost_UserId(hostId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClothingResponse> listByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return clothingRepository.findByPricePerDayBetween(minPrice, maxPrice).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClothingResponse> listByCategory(Long categoryId) {
        return clothingRepository.findByCategory_CategoryId(categoryId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClothingResponse getById(Long id) {
        return toResponse(findClothing(id));
    }

    @Transactional(readOnly = true)
    public List<ClothingSizeResponse> getSizes(Long clothingId) {
        findClothing(clothingId);
        return clothingSizeRepository.findByClothing_ClothingIdOrderByClothingSizeIdAsc(clothingId).stream()
                .map(ClothingSizeResponse::from)
                .toList();
    }

    @Transactional
    public ClothingResponse create(ClothingRequest request) {
        Category category = findCategory(request.categoryId());
        Clothing clothing = new Clothing();
        clothing.setCategory(category);
        clothing.setHost(resolveHost(request.hostId()));
        applyBasicFields(clothing, request);
        applySizes(clothing, request.sizes());
        return toResponse(clothingRepository.save(clothing));
    }

    @Transactional
    public ClothingResponse update(Long id, ClothingRequest request) {
        Clothing clothing = findClothing(id);
        Category category = findCategory(request.categoryId());
        clothing.setCategory(category);
        if (request.hostId() != null) {
            clothing.setHost(resolveHost(request.hostId()));
        }
        applyBasicFields(clothing, request);
        if (request.sizes() != null) {
            clothing.getSizes().clear();
            applySizes(clothing, request.sizes());
        }
        return toResponse(clothingRepository.save(clothing));
    }

    @Transactional
    public void delete(Long id) {
        Clothing clothing = findClothing(id);
        if (!clothing.getRentalItems().isEmpty()) {
            throw new BadRequestException("Cannot delete clothing that appears in rental records");
        }
        clothingRepository.delete(clothing);
    }

    @Transactional(readOnly = true)
    public AvailabilityResponse checkAvailability(Long clothingId, LocalDate startDate, LocalDate endDate,
                                                  String size, int requestedQuantity) {
        Clothing clothing = findClothing(clothingId);
        if (startDate == null || endDate == null || size == null || size.isBlank()) {
            throw new BadRequestException("startDate, endDate and size are required");
        }
        if (!endDate.isAfter(startDate)) {
            throw new BadRequestException("endDate must be after startDate");
        }
        if (requestedQuantity <= 0) {
            throw new BadRequestException("requestedQuantity must be greater than 0");
        }

        ClothingSize sizeRow = clothingSizeRepository.findByClothing_ClothingIdAndSize(clothingId, size.trim())
                .orElseGet(() -> clothingSizeRepository.findByClothing_ClothingIdAndSize(clothingId, "Free Size")
                        .orElse(null));

        int reserved = reservedQuantity(clothingId, startDate, endDate);
        int clothingAvailable = Math.max(0, clothing.getStock() - reserved);
        int sizeAvailable = (sizeRow == null) ? 0 : Math.max(0, sizeRow.getStock() - reserved);
        int available = Math.min(clothingAvailable, sizeAvailable);

        boolean availableFlag = available >= requestedQuantity;
        String message;
        if (sizeRow == null) {
            message = "Size '" + size + "' is not available for this item";
        } else if (availableFlag) {
            message = "Available. " + requestedQuantity + " unit(s) can be rented for the selected dates";
        } else {
            message = "Insufficient stock for the selected dates (available: " + available + ")";
        }

        return new AvailabilityResponse(availableFlag, available, requestedQuantity, message);
    }

    private int reservedQuantity(Long clothingId, LocalDate startDate, LocalDate endDate) {
        return rentalItemRepository.findOverlappingActiveItems(clothingId, startDate, endDate).stream()
                .mapToInt(RentalItem::getQuantity)
                .sum();
    }

    private void applyBasicFields(Clothing clothing, ClothingRequest request) {
        clothing.setName(request.name());
        clothing.setDescription(request.description());
        clothing.setPricePerDay(request.pricePerDay());
        clothing.setPrice1Day(request.price1Day());
        clothing.setPrice2Day(request.price2Day());
        clothing.setPrice3Day(request.price3Day());
        clothing.setPrice1Week(request.price1Week());
        clothing.setImageUrl(request.imageUrl());
        clothing.setColor(request.color());
        clothing.setStock(request.stock());
        clothing.setGender(request.gender() == null ? "WOMEN" : request.gender());
        clothing.setActive(request.active() == null || request.active());
    }

    private void applySizes(Clothing clothing, List<ClothingSizeRequest> sizes) {
        if (sizes == null) {
            return;
        }
        sizes.forEach(size -> {
            if (size != null) {
                clothing.getSizes().add(new ClothingSize(clothing, size.size(), size.stock()));
            }
        });
    }

    private ClothingResponse toResponse(Clothing clothing) {
        List<ClothingSizeResponse> sizes = clothing.getSizes().stream()
                .map(ClothingSizeResponse::from)
                .toList();
        return ClothingResponse.from(clothing, sizes);
    }

    private Clothing findClothing(Long id) {
        return clothingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clothing not found with id: " + id));
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    private User resolveHost(Long requestedHostId) {
        User current = securityUtils.currentUser();
        if (requestedHostId != null && "ADMIN".equals(current.getRole())) {
            return userRepository.findById(requestedHostId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + requestedHostId));
        }
        if (!"HOST".equals(current.getRole())) {
            throw new BadRequestException("Only a host can upload clothing");
        }
        return current;
    }

    private boolean categoryIsBlankOr(String category, Clothing c) {
        if (category == null || category.isBlank()) {
            return true;
        }
        Long id = parseIntOrNull(category);
        if (id != null) {
            return Objects.equals(c.getCategory().getCategoryId(), id);
        }
        return c.getCategory().getCategoryName().equalsIgnoreCase(category.trim());
    }

    private boolean colorIsBlankOr(String color, Clothing c) {
        return color == null || color.isBlank() || c.getColor() != null
                && c.getColor().equalsIgnoreCase(color.trim());
    }

    private Long parseIntOrNull(String value) {
        try {
            return Long.parseLong(value.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}