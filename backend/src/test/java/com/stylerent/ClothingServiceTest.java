package com.stylerent;

import com.stylerent.dto.AvailabilityResponse;
import com.stylerent.dto.ClothingResponse;
import com.stylerent.dto.ClothingSizeRequest;
import com.stylerent.dto.ClothingRequest;
import com.stylerent.dto.ClothingSizeResponse;
import com.stylerent.entity.Category;
import com.stylerent.entity.Clothing;
import com.stylerent.entity.ClothingSize;
import com.stylerent.entity.Rental;
import com.stylerent.entity.RentalItem;
import com.stylerent.exception.BadRequestException;
import com.stylerent.exception.ResourceNotFoundException;
import com.stylerent.repository.CategoryRepository;
import com.stylerent.repository.ClothingRepository;
import com.stylerent.repository.ClothingSizeRepository;
import com.stylerent.repository.RentalItemRepository;
import com.stylerent.service.ClothingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClothingServiceTest {

    @Mock
    private ClothingRepository clothingRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private ClothingSizeRepository clothingSizeRepository;
    @Mock
    private RentalItemRepository rentalItemRepository;

    private ClothingService clothingService;

    @BeforeEach
    void setUp() {
        clothingService = new ClothingService(
                clothingRepository, categoryRepository, clothingSizeRepository, rentalItemRepository);
    }

    private Clothing sampleClothing() {
        Category category = new Category("Gowns", "Evening wear");
        category.setCategoryId(3L);
        Clothing clothing = new Clothing();
        clothing.setClothingId(1L);
        clothing.setCategory(category);
        clothing.setName("Midnight Black Evening Gown");
        clothing.setPricePerDay(new BigDecimal("2900.00"));
        clothing.setStock(6);
        return clothing;
    }

    @Test
    void getByIdReturnsDtosWithSizes() {
        Clothing clothing = sampleClothing();
        when(clothingRepository.findById(1L)).thenReturn(Optional.of(clothing));

        ClothingResponse response = clothingService.getById(1L);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.categoryName()).isEqualTo("Gowns");
        assertThat(response.sizes()).isEmpty();
    }

    @Test
    void getByIdMissingThrows() {
        when(clothingRepository.findById(999L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> clothingService.getById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void listFiltersByName() {
        when(clothingRepository.findByNameContainingIgnoreCase("gown")).thenReturn(List.of(sampleClothing()));
        assertThat(clothingService.list("gown", null, null, null, null)).hasSize(1);
    }

    @Test
    void listFiltersByPriceRange() {
        Clothing rich = sampleClothing();
        rich.setPricePerDay(new BigDecimal("100.00"));
        Clothing cheap = sampleClothing();
        cheap.setClothingId(2L);
        cheap.setPricePerDay(new BigDecimal("10.00"));
        when(clothingRepository.findAll()).thenReturn(List.of(rich, cheap));

        List<ClothingResponse> result = clothingService.list(null, null, null, new BigDecimal("20"), null);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).pricePerDay()).isEqualByComparingTo("100.00");
    }

    @Test
    void availabilityBlocksWhenOverlappingBookingsEatStock() {
        Clothing clothing = sampleClothing();
        when(clothingRepository.findById(1L)).thenReturn(Optional.of(clothing));
        when(clothingSizeRepository.findByClothing_ClothingIdAndSize(1L, "M"))
                .thenReturn(Optional.of(new ClothingSize(clothing, "M", 6)));

        Rental rental = new Rental();
        RentalItem item = new RentalItem();
        item.setQuantity(4);
        item.setRental(rental);
        when(rentalItemRepository.findOverlappingActiveItems(anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(item));

        AvailabilityResponse response = clothingService.checkAvailability(
                1L, LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 3), "M", 3);

        assertThat(response.available()).isFalse();
        assertThat(response.availableStock()).isEqualTo(2);
        assertThat(response.requestedQuantity()).isEqualTo(3);
    }

    @Test
    void availabilityAllowsWhenEnoughStock() {
        Clothing clothing = sampleClothing();
        when(clothingRepository.findById(1L)).thenReturn(Optional.of(clothing));
        when(clothingSizeRepository.findByClothing_ClothingIdAndSize(1L, "M"))
                .thenReturn(Optional.of(new ClothingSize(clothing, "M", 6)));
        when(rentalItemRepository.findOverlappingActiveItems(anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());

        AvailabilityResponse response = clothingService.checkAvailability(
                1L, LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 3), "M", 2);

        assertThat(response.available()).isTrue();
        assertThat(response.availableStock()).isEqualTo(6);
    }

    @Test
    void availabilityRejectsBadDates() {
        when(clothingRepository.findById(1L)).thenReturn(Optional.of(sampleClothing()));
        assertThatThrownBy(() -> clothingService.checkAvailability(
                1L, LocalDate.of(2026, 10, 3), LocalDate.of(2026, 10, 1), "M", 1))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void createPersistsSizes() {
        when(categoryRepository.findById(3L)).thenReturn(Optional.of(sampleClothing().getCategory()));
        when(clothingRepository.save(any(Clothing.class))).thenAnswer(inv -> {
            Clothing c = inv.getArgument(0);
            c.setClothingId(50L);
            return c;
        });

        ClothingRequest request = new ClothingRequest(
                3L, "Test Gown", "Desc", new BigDecimal("200.00"),
                "img", "Black", 5,
                List.of(new ClothingSizeRequest("M", 3), new ClothingSizeRequest("L", 2)));

        ClothingResponse response = clothingService.create(request);
        assertThat(response.id()).isEqualTo(50L);
        assertThat(response.sizes()).hasSize(2);
        assertThat(response.sizes().stream().map(ClothingSizeResponse::size))
                .containsExactly("M", "L");
    }

    @Test
    void searchUsesNameQuery() {
        when(clothingRepository.findByNameContainingIgnoreCase("saree")).thenReturn(List.of(sampleClothing()));
        assertThat(clothingService.list("saree", null, null, null, null)).hasSize(1);
    }
}