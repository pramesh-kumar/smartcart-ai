package com.smartcart.api.domain.product;

import com.smartcart.api.domain.product.dto.ProductCreateRequestDto;
import com.smartcart.api.domain.product.dto.ProductResponseDto;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface ProductService {
    
    ProductResponseDto createProduct(ProductCreateRequestDto dto);
    
    ProductResponseDto updateProduct(UUID id, ProductCreateRequestDto dto);
    
    void deleteProduct(UUID id);
    
    ProductResponseDto getProductById(UUID id);
    
    Page<ProductResponseDto> getAllProducts(UUID categoryId, String keyword, int page, int size, String sortBy, String sortDir);
}
