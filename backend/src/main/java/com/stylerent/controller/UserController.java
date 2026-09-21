package com.stylerent.controller;

import com.stylerent.dto.ApiResponse;
import com.stylerent.dto.RoleUpdateRequest;
import com.stylerent.dto.UserResponse;
import com.stylerent.dto.UserUpdateRequest;
import com.stylerent.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Own profile and (admin) user management")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get the current user's profile")
    public ResponseEntity<ApiResponse<UserResponse>> me() {
        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved", userService.me()));
    }

    @PutMapping("/me")
    @Operation(summary = "Update the current user's profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateMe(@Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", userService.updateMe(request)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all users (admin only)")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listAll() {
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved", userService.listAll()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get a single user (admin only)")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("User retrieved", userService.getById(id)));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Change a user's role (admin only)")
    public ResponseEntity<ApiResponse<UserResponse>> updateRole(@PathVariable Long id,
                                                                @Valid @RequestBody RoleUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Role updated", userService.updateRole(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a user (admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted"));
    }
}