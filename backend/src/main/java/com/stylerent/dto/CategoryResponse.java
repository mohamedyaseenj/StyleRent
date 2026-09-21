package com.stylerent.dto;

import com.stylerent.entity.Category;

public record CategoryResponse(Long id, String name, String description) {

    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getCategoryId(),
                category.getCategoryName(),
                category.getDescription()
        );
    }

    public static CategoryResponse of(Long id, String name, String description) {
        return new CategoryResponse(id, name, description);
    }
}