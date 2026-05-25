package com.smartcart.api.domain.product;

import com.smartcart.api.domain.category.Category;
import com.smartcart.api.domain.category.CategoryRepository;
import com.smartcart.api.domain.product.dto.ProductCreateRequestDto;
import com.smartcart.api.domain.product.dto.ProductResponseDto;
import com.smartcart.api.exception.BadRequestException;
import com.smartcart.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public ProductResponseDto createProduct(ProductCreateRequestDto dto) {
        // 1. Enforce unique SKUs in database
        if (productRepository.existsBySku(dto.getSku())) {
            throw new BadRequestException("SKU " + dto.getSku() + " is already registered!");
        }

        // 2. Fetch target category
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));

        // 3. Generate unique, SEO-friendly URL Slug
        String slug = generateSlug(dto.getName());
        if (productRepository.existsBySlug(slug)) {
            // Suffix with SKU to ensure absolute uniqueness if two items share the exact same name
            slug = slug + "-" + dto.getSku().toLowerCase(Locale.ROOT);
        }

        // 4. Save and return DTO
        Product product = Product.builder()
                .name(dto.getName())
                .slug(slug)
                .description(dto.getDescription())
                .price(dto.getPrice())
                .stockQuantity(dto.getStockQuantity())
                .sku(dto.getSku())
                .category(category)
                .imageUrl(dto.getImageUrl())
                .build();

        Product savedProduct = productRepository.save(product);
        return mapToResponseDto(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponseDto updateProduct(UUID id, ProductCreateRequestDto dto) {
        // 1. Fetch target product
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // 2. Enforce SKU uniqueness (ignoring checking against itself)
        if (!product.getSku().equals(dto.getSku()) && productRepository.existsBySku(dto.getSku())) {
            throw new BadRequestException("SKU " + dto.getSku() + " is already in use by another product!");
        }

        // 3. Fetch target category if updated
        if (!product.getCategory().getId().equals(dto.getCategoryId())) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));
            product.setCategory(category);
        }

        // 4. Update fields
        if (!product.getName().equals(dto.getName())) {
            String slug = generateSlug(dto.getName());
            if (productRepository.existsBySlug(slug)) {
                slug = slug + "-" + dto.getSku().toLowerCase(Locale.ROOT);
            }
            product.setName(dto.getName());
            product.setSlug(slug);
        }

        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setSku(dto.getSku());
        product.setImageUrl(dto.getImageUrl());

        Product updatedProduct = productRepository.save(product);
        return mapToResponseDto(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        productRepository.delete(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDto getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToResponseDto(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDto> getAllProducts(UUID categoryId, String keyword, int page, int size, String sortBy, String sortDir) {
        // Enforce sorting direction safety checks
        Sort.Direction direction = Sort.Direction.DESC;
        if (sortDir.equalsIgnoreCase("asc")) {
            direction = Sort.Direction.ASC;
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<Product> productsPage = productRepository.searchProducts(categoryId, keyword, pageable);
        
        return productsPage.map(this::mapToResponseDto);
    }

    // --- Helper Utility Methods ---
    
    private String generateSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        return input.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s]", "") // Remove all non-alphanumeric chars (except spaces)
                .replaceAll("\\s+", "-")       // Replace all spaces with hyphens
                .replaceAll("^-|-$", "");      // Strip leading or trailing hyphens
    }

    private ProductResponseDto mapToResponseDto(Product product) {
        return ProductResponseDto.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .sku(product.getSku())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .imageUrl(product.getImageUrl())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
