package com.smartcart.api.domain.auth;

import com.smartcart.api.domain.auth.dto.AuthResponseDto;
import com.smartcart.api.domain.auth.dto.UserLoginRequestDto;
import com.smartcart.api.domain.auth.dto.UserRegisterRequestDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication Interface", description = "Endpoints for user registration, token acquisition, and identity validation")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user account", description = "Creates a new customer account, hashes the password via BCrypt, and maps default user roles.")
    @ApiResponse(responseCode = "201", description = "User created successfully")
    @ApiResponse(responseCode = "400", description = "Email is already taken or invalid inputs")
    public ResponseEntity<Map<String, String>> registerUser(@Valid @RequestBody UserRegisterRequestDto registerDto) {
        String result = authService.register(registerDto);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", result);
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials", description = "Verifies user credentials and issues a secure, signed HS256 JWT access token.")
    @ApiResponse(responseCode = "200", description = "Successful authentication")
    @ApiResponse(responseCode = "401", description = "Invalid credentials provided")
    public ResponseEntity<AuthResponseDto> authenticateUser(@Valid @RequestBody UserLoginRequestDto loginDto) {
        AuthResponseDto tokenResponse = authService.login(loginDto);
        return ResponseEntity.ok(tokenResponse);
    }

    @org.springframework.web.bind.annotation.GetMapping("/me")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get current user profile", description = "Retrieves user identity metadata matching the parsed JWT context.")
    @ApiResponse(responseCode = "200", description = "Successful retrieval")
    @ApiResponse(responseCode = "401", description = "Token is missing or invalid")
    public ResponseEntity<com.smartcart.api.domain.auth.dto.UserProfileResponseDto> getMyProfile(org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        com.smartcart.api.domain.auth.dto.UserProfileResponseDto profile = authService.getProfile(email);
        return ResponseEntity.ok(profile);
    }
}
