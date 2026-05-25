package com.smartcart.api.domain.cart;

import com.smartcart.api.domain.cart.dto.CartItemRequestDto;
import com.smartcart.api.domain.cart.dto.CartItemResponseDto;
import com.smartcart.api.domain.cart.dto.CartResponseDto;
import com.smartcart.api.domain.product.Product;
import com.smartcart.api.domain.product.ProductRepository;
import com.smartcart.api.domain.user.User;
import com.smartcart.api.domain.user.UserRepository;
import com.smartcart.api.exception.BadRequestException;
import com.smartcart.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public CartResponseDto getCart(String email) {
        Cart cart = getOrCreateCartForUser(email);
        return mapToResponseDto(cart);
    }

    @Override
    @Transactional
    public CartResponseDto addItemToCart(String email, CartItemRequestDto dto) {
        Cart cart = getOrCreateCartForUser(email);
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", dto.getProductId()));

        // 1. Verify product has sufficient inventory
        if (product.getStockQuantity() < dto.getQuantity()) {
            throw new BadRequestException("Insufficient inventory available! Remaining stock: " + product.getStockQuantity());
        }

        // 2. Prevent Duplicate Cart Item Bug: Check if the product is already in the cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + dto.getQuantity();
            
            // Check inventory limits again for combined quantity
            if (product.getStockQuantity() < newQuantity) {
                throw new BadRequestException("Cannot add requested amount. Combined quantity (" 
                        + newQuantity + ") exceeds remaining stock (" + product.getStockQuantity() + ").");
            }
            item.setQuantity(newQuantity);
        } else {
            // Add new cart item
            CartItem newItem = CartItem.builder()
                    .product(product)
                    .quantity(dto.getQuantity())
                    .build();
            cart.addItem(newItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return mapToResponseDto(savedCart);
    }

    @Override
    @Transactional
    public CartResponseDto updateCartItemQuantity(String email, UUID cartItemId, Integer quantity) {
        Cart cart = getOrCreateCartForUser(email);
        
        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than zero. To remove, use the delete endpoint.");
        }

        // Verify stock limits
        Product product = cartItem.getProduct();
        if (product.getStockQuantity() < quantity) {
            throw new BadRequestException("Insufficient inventory available! Remaining stock: " + product.getStockQuantity());
        }

        cartItem.setQuantity(quantity);
        Cart savedCart = cartRepository.save(cart);
        return mapToResponseDto(savedCart);
    }

    @Override
    @Transactional
    public CartResponseDto removeItemFromCart(String email, UUID cartItemId) {
        Cart cart = getOrCreateCartForUser(email);
        
        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        // Bidirectional helper removes the references and cascade ALL + orphanRemoval purges it from PostgreSQL
        cart.removeItem(cartItem);
        
        Cart savedCart = cartRepository.save(cart);
        return mapToResponseDto(savedCart);
    }

    // --- Helper Utility Methods ---

    private Cart getOrCreateCartForUser(String email) {
        return cartRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
                    
                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    private CartResponseDto mapToResponseDto(Cart cart) {
        List<CartItemResponseDto> itemDtos = cart.getItems().stream()
                .map(item -> {
                    BigDecimal price = item.getProduct().getPrice();
                    BigDecimal totalItemPrice = price.multiply(BigDecimal.valueOf(item.getQuantity()));
                    
                    return CartItemResponseDto.builder()
                            .cartItemId(item.getId())
                            .productId(item.getProduct().getId())
                            .productName(item.getProduct().getName())
                            .productSku(item.getProduct().getSku())
                            .productPrice(price)
                            .quantity(item.getQuantity())
                            .totalItemPrice(totalItemPrice)
                            .build();
                })
                .collect(Collectors.toList());

        // Calculate grand cart total cleanly using BigDecimal stream reduction
        BigDecimal totalCartPrice = itemDtos.stream()
                .map(CartItemResponseDto::getTotalItemPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponseDto.builder()
                .cartId(cart.getId())
                .userEmail(cart.getUser().getEmail())
                .items(itemDtos)
                .totalCartPrice(totalCartPrice)
                .build();
    }
}
