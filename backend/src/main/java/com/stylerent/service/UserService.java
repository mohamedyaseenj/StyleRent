package com.stylerent.service;

import com.stylerent.dto.RoleUpdateRequest;
import com.stylerent.dto.UserResponse;
import com.stylerent.dto.UserUpdateRequest;
import com.stylerent.entity.User;
import com.stylerent.exception.BadRequestException;
import com.stylerent.exception.ResourceNotFoundException;
import com.stylerent.repository.RoleRepository;
import com.stylerent.repository.UserRepository;
import com.stylerent.security.SecurityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private static final List<String> PLATFORM_ROLES = List.of("USER", "HOST", "ADMIN");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       SecurityUtils securityUtils) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityUtils = securityUtils;
    }

    @Transactional(readOnly = true)
    public UserResponse me() {
        return UserResponse.from(securityUtils.currentUser());
    }

    @Transactional
    public UserResponse updateMe(UserUpdateRequest request) {
        User user = securityUtils.currentUser();
        user.setName(request.name());
        user.setPhone(request.phone());
        user.setAddress(request.address());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return UserResponse.from(findUser(id));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listAll() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listByRole(String role) {
        return userRepository.findByRole(role).stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional
    public UserResponse setActive(Long id, boolean active) {
        User user = findUser(id);
        user.setActive(active);
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateRole(Long id, RoleUpdateRequest request) {
        if (!PLATFORM_ROLES.contains(request.role())) {
            throw new BadRequestException("Role must be one of USER, HOST, ADMIN");
        }
        if (roleRepository.findByRoleName(request.role()).isEmpty()) {
            throw new BadRequestException("Role '" + request.role() + "' is not registered in the roles table");
        }
        User user = findUser(id);
        user.setRole(request.role());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = findUser(id);
        if (!user.getRentals().isEmpty() || !user.getReviews().isEmpty()) {
            throw new BadRequestException("User cannot be deleted with existing rentals or reviews");
        }
        userRepository.delete(user);
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
}