package com.stylerent;

import com.stylerent.dto.LoginRequest;
import com.stylerent.dto.LoginResponse;
import com.stylerent.dto.RegisterRequest;
import com.stylerent.dto.UserResponse;
import com.stylerent.entity.User;
import com.stylerent.exception.BadRequestException;
import com.stylerent.repository.UserRepository;
import com.stylerent.security.JwtService;
import com.stylerent.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, authenticationManager, jwtService);
    }

    @Test
    void registerEncodesPasswordAndAssignsUserRole() {
        when(userRepository.existsByEmail("a@b.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(99L);
            return u;
        });

        RegisterRequest request = new RegisterRequest("Aarav", "a@b.com", "secret123", "9810", "Mumbai");
        UserResponse response = authService.register(request);

        assertThat(response.role()).isEqualTo("USER");
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPassword()).isNotEqualTo("secret123");
        assertThat(passwordEncoder.matches("secret123", captor.getValue().getPassword())).isTrue();
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.existsByEmail("a@b.com")).thenReturn(true);
        RegisterRequest request = new RegisterRequest("Aarav", "a@b.com", "secret123", null, null);
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already registered");
    }

    @Test
    void loginReturnsTokenAndUser() {
        User user = new User("Aarav", "a@b.com", "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", null, null, "USER");
        user.setUserId(1L);
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken("a@b.com", "USER")).thenReturn("jwt-token");

        LoginResponse response = authService.login(new LoginRequest("a@b.com", "password"));

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.user().email()).isEqualTo("a@b.com");
    }

    @Test
    void loginWithUnknownUserThrows() {
        when(userRepository.findByEmail("missing@b.com")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> authService.login(new LoginRequest("missing@b.com", "password")))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid email or password");
    }
}