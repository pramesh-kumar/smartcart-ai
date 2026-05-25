package com.smartcart.api.domain.product;

import com.smartcart.api.domain.product.dto.ProductCreateRequestDto;
import com.smartcart.api.domain.product.dto.ProductResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Product Catalog", description = "Endpoints for managing products, inventories, searches, and paginated listings")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new product (ADMIN ONLY)", description = "Adds a new product to the catalog. SKU must be globally unique.")
    @ApiResponse(responseCode = "201", description = "Product created successfully")
    @ApiResponse(responseCode = "400", description = "SKU already in use or input validation failed")
    @ApiResponse(responseCode = "403", description = "Insufficient privileges (Admin required)")
    public ResponseEntity<ProductResponseDto> createProduct(@Valid @RequestBody ProductCreateRequestDto dto) {
        ProductResponseDto createdProduct = productService.createProduct(dto);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update an existing product (ADMIN ONLY)", description = "Modifies catalog items. Regenerates slugs automatically if product names change.")
    @ApiResponse(responseCode = "200", description = "Product updated successfully")
    @ApiResponse(responseCode = "404", description = "Product or Category ID not found")
    @ApiResponse(responseCode = "403", description = "Admin permissions required")
    public ResponseEntity<ProductResponseDto> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductCreateRequestDto dto) {
        ProductResponseDto updatedProduct = productService.updateProduct(id, dto);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a product (ADMIN ONLY)", description = "Purges a product from the catalog. Restricts action if referenced in past transactions.")
    @ApiResponse(responseCode = "204", description = "Product deleted successfully")
    @ApiResponse(responseCode = "404", description = "Product not found")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product details by ID", description = "Retrieves complete catalog metadata including precise pricing and stock levels.")
    @ApiResponse(responseCode = "200", description = "Successful retrieval")
    @ApiResponse(responseCode = "404", description = "Product not found")
    public ResponseEntity<ProductResponseDto> getProductById(@PathVariable UUID id) {
        ProductResponseDto product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping
    @Operation(summary = "List, Search, and Filter Products", description = "Offers full, high-performance paginated product listings. Supports combined category filters and keyword matching.")
    public ResponseEntity<Page<ProductResponseDto>> getAllProducts(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Page<ProductResponseDto> products = productService.getAllProducts(
                categoryId, keyword, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(products);
    }
}
