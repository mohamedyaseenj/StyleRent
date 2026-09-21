package com.stylerent;

import com.stylerent.dto.ReviewRequest;
import com.stylerent.dto.ReviewResponse;
import com.stylerent.entity.Clothing;
import com.stylerent.entity.Review;
import com.stylerent.entity.User;
import com.stylerent.exception.UnauthorizedException;
import com.stylerent.repository.ClothingRepository;
import com.stylerent.repository.ReviewRepository;
import com.stylerent.security.SecurityUtils;
import com.stylerent.service.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private ClothingRepository clothingRepository;
    @Mock
    private SecurityUtils securityUtils;

    private ReviewService reviewService;

    @BeforeEach
    void setUp() {
        reviewService = new ReviewService(reviewRepository, clothingRepository, securityUtils);
    }

    @Test
    void createStoresRatingIn1To5Range() {
        User user = new User("Aarav", "a@b.com", "h", null, null, "USER");
        user.setUserId(1L);
        Clothing clothing = new Clothing();
        clothing.setClothingId(1L);
        clothing.setName("Lehenga");

        when(securityUtils.currentUser()).thenReturn(user);
        when(clothingRepository.findById(1L)).thenReturn(Optional.of(clothing));
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
            Review r = inv.getArgument(0);
            r.setReviewId(9L);
            return r;
        });

        ReviewResponse response = reviewService.create(new ReviewRequest(1L, 5, "Loved it"));

        assertThat(response.rating()).isEqualTo(5);
        assertThat(response.userName()).isEqualTo("Aarav");
    }

    @Test
    void nonAuthorCannotUpdateReview() {
        User author = new User("Meera", "m@b.com", "h", null, null, "USER");
        author.setUserId(2L);
        User other = new User("Aarav", "a@b.com", "h", null, null, "USER");
        other.setUserId(1L);

        Review review = new Review();
        review.setReviewId(9L);
        review.setUser(author);
        review.setRating((byte) 4);

        when(reviewRepository.findById(9L)).thenReturn(Optional.of(review));
        when(securityUtils.currentUser()).thenReturn(other);

        assertThatThrownBy(() -> reviewService.update(9L, new ReviewRequest(1L, 5, "edited")))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void authorCanUpdateReview() {
        User author = new User("Meera", "m@b.com", "h", null, null, "USER");
        author.setUserId(2L);
        Clothing clothing = new Clothing();
        clothing.setClothingId(5L);

        Review review = new Review();
        review.setReviewId(9L);
        review.setUser(author);
        review.setClothing(clothing);
        review.setRating((byte) 4);

        when(reviewRepository.findById(9L)).thenReturn(Optional.of(review));
        when(securityUtils.currentUser()).thenReturn(author);
        lenient().when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));

        ReviewResponse response = reviewService.update(9L, new ReviewRequest(5L, 5, "edited"));

        assertThat(response.rating()).isEqualTo(5);
        assertThat(response.comment()).isEqualTo("edited");
    }
}