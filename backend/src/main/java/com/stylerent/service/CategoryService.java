package com.stylerent.service;

import com.stylerent.dto.CategoryRequest;
import com.stylerent.dto.CategoryResponse;
import com.stylerent.entity.Category;
import com.stylerent.exception.BadRequestException;
import com.stylerent.exception.ResourceNotFoundException;
import com.stylerent.repository.CategoryRepository;
import com.stylerent.repository.ClothingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ClothingRepository clothingRepository;

    public CategoryService(CategoryRepository categoryRepository,
                           ClothingRepository clothingRepository) {
        this.categoryRepository = categoryRepository;
        this.clothingRepository = clothingRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list() {
        return categoryRepository.findAllByOrderByCategoryNameAsc().stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        return CategoryResponse.from(findCategory(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByCategoryName(request.categoryName())) {
            throw new BadRequestException("Category already exists: " + request.categoryName());
        }
        Category category = new Category(request.categoryName(), request.description());
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findCategory(id);
        categoryRepository.findByCategoryName(request.categoryName())
                .filter(existing -> !existing.getCategoryId().equals(id))
                .ifPresent(existing -> {
                    throw new BadRequestException("Category already exists: " + request.categoryName());
                });
        category.setCategoryName(request.categoryName());
        category.setDescription(request.description());
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        Category category = findCategory(id);
        if (!clothingRepository.findByCategory_CategoryId(id).isEmpty()) {
            throw new BadRequestException("Cannot delete category that still has clothing items");
        }
        categoryRepository.delete(category);
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }
}