package com.stylerent.service;

import com.stylerent.dto.LoginRequest;
import com.stylerent.dto.LoginResponse;
import com.stylerent.dto.RegisterRequest;
import com.stylerent.dto.UserResponse;
import com.stylerent.entity.User;
import com.stylerent.exception.BadRequestException;
import com.stylerent.repository.UserRepository;
import com.stylerent.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    public static final String DEFAULT_ROLE = "USER";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already registered: " + request.email());
        }
        User user = new User(
                request.name(),
                request.email(),
                passwordEncoder.encode(request.password()),
                request.phone(),
                request.address(),
                DEFAULT_ROLE
        );
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (BadCredentialsException ex) {
            throw new BadRequestException("Invalid email or password");
        }
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        return LoginResponse.of(token, UserResponse.from(user));
    }
}