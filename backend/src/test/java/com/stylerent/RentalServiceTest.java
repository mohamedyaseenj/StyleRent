package com.stylerent;

import com.stylerent.dto.RentalItemRequest;
import com.stylerent.dto.RentalRequest;
import com.stylerent.dto.RentalResponse;
import com.stylerent.entity.Clothing;
import com.stylerent.entity.ClothingSize;
import com.stylerent.entity.Rental;
import com.stylerent.entity.RentalItem;
import com.stylerent.entity.User;
import com.stylerent.exception.BadRequestException;
import com.stylerent.repository.ClothingRepository;
import com.stylerent.repository.ClothingSizeRepository;
import com.stylerent.repository.RentalItemRepository;
import com.stylerent.repository.RentalRepository;
import com.stylerent.security.SecurityUtils;
import com.stylerent.service.RentalService;
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
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RentalServiceTest {

    @Mock
    private RentalRepository rentalRepository;
    @Mock
    private RentalItemRepository rentalItemRepository;
    @Mock
    private ClothingRepository clothingRepository;
    @Mock
    private ClothingSizeRepository clothingSizeRepository;
    @Mock
    private SecurityUtils securityUtils;

    private RentalService rentalService;

    @BeforeEach
    void setUp() {
        rentalService = new RentalService(
                rentalRepository, rentalItemRepository, clothingRepository, clothingSizeRepository, securityUtils);
    }

    private Clothing sampleClothing() {
        Clothing clothing = new Clothing();
        clothing.setClothingId(1L);
        clothing.setName("Royal Ivory Lehenga");
        clothing.setPricePerDay(new BigDecimal("4800.00"));
        clothing.setStock(6);
        return clothing;
    }

    @Test
    void createCalculatesSubtotalAndTotalFromBackendPrices() {
        User user = new User("Aarav", "a@b.com", "hash", null, null, "USER");
        user.setUserId(1L);
        Clothing clothing = sampleClothing();
        Rental saved = new Rental();

        when(securityUtils.currentUser()).thenReturn(user);
        when(clothingRepository.findById(1L)).thenReturn(Optional.of(clothing));
        when(clothingSizeRepository.findByClothing_ClothingIdAndSize(1L, "M"))
                .thenReturn(Optional.of(new ClothingSize(clothing, "M", 6)));
        when(rentalItemRepository.findOverlappingActiveItems(anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());
        when(rentalRepository.save(any(Rental.class))).thenAnswer(inv -> {
            Rental r = inv.getArgument(0);
            r.setRentalId(77L);
            return r;
        });
        lenient().when(rentalItemRepository.save(any(RentalItem.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(clothingRepository.save(any(Clothing.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(clothingSizeRepository.save(any(ClothingSize.class))).thenAnswer(inv -> inv.getArgument(0));

        LocalDate start = LocalDate.of(2026, 11, 1);
        LocalDate end = LocalDate.of(2026, 11, 4);
        RentalRequest request = new RentalRequest(start, end,
                List.of(new RentalItemRequest(1L, "M", 2)));

        RentalResponse response = rentalService.create(request);

        // 3 days * 4800 * qty2 = 28800, backend-computed not frontend-supplied
        assertThat(response.totalAmount()).isEqualByComparingTo("28800.00");
        verify(rentalRepository).save(any(Rental.class));
    }

    @Test
    void createRejectsEqualDates() {
        when(securityUtils.currentUser()).thenReturn(new User("A", "a@b.com", "h", null, null, "USER"));
        LocalDate day = LocalDate.of(2026, 11, 1);
        RentalRequest request = new RentalRequest(day, day,
                List.of(new RentalItemRequest(1L, "M", 1)));

        assertThatThrownBy(() -> rentalService.create(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("endDate must be after startDate");
    }

    @Test
    void createRollsBackWhenInsufficientStock() {
        when(securityUtils.currentUser()).thenReturn(new User("A", "a@b.com", "h", null, null, "USER"));
        Clothing clothing = sampleClothing();
        clothing.setStock(1);

        when(clothingRepository.findById(1L)).thenReturn(Optional.of(clothing));
        when(clothingSizeRepository.findByClothing_ClothingIdAndSize(1L, "M"))
                .thenReturn(Optional.of(new ClothingSize(clothing, "M", 1)));
        when(rentalItemRepository.findOverlappingActiveItems(anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());

        RentalRequest request = new RentalRequest(
                LocalDate.of(2026, 11, 1), LocalDate.of(2026, 11, 4),
                List.of(new RentalItemRequest(1L, "M", 2)));

        assertThatThrownBy(() -> rentalService.create(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Insufficient stock");
        // No partial rental persisted
        verify(rentalRepository, never()).save(any(Rental.class));
    }

    @Test
    void createRejectsUnknownSize() {
        when(securityUtils.currentUser()).thenReturn(new User("A", "a@b.com", "h", null, null, "USER"));
        when(clothingRepository.findById(1L)).thenReturn(Optional.of(sampleClothing()));
        when(clothingSizeRepository.findByClothing_ClothingIdAndSize(1L, "XXL")).thenReturn(Optional.empty());
        when(rentalItemRepository.findOverlappingActiveItems(anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());

        RentalRequest request = new RentalRequest(
                LocalDate.of(2026, 11, 1), LocalDate.of(2026, 11, 4),
                List.of(new RentalItemRequest(1L, "XXL", 1)));

        assertThatThrownBy(() -> rentalService.create(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not available");
        verify(rentalRepository, never()).save(any(Rental.class));
    }
}