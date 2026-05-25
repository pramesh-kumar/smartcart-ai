package com.smartcart.api.domain.auth;

import com.smartcart.api.domain.auth.dto.AuthResponseDto;
import com.smartcart.api.domain.auth.dto.UserLoginRequestDto;
import com.smartcart.api.domain.auth.dto.UserRegisterRequestDto;
import com.smartcart.api.domain.user.Role;
import com.smartcart.api.domain.user.RoleRepository;
import com.smartcart.api.domain.user.User;
import com.smartcart.api.domain.user.UserRepository;
import com.smartcart.api.exception.BadRequestException;
import com.smartcart.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Override
    @Transactional
    public String register(UserRegisterRequestDto registerDto) {
        // 1. Check if email is already taken
        if (userRepository.existsByEmail(registerDto.getEmail())) {
            throw new BadRequestException("Email address is already in use!");
        }

        // 2. Fetch the default role 'ROLE_CUSTOMER' from database
        Role userRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "ROLE_CUSTOMER"));

        // 3. Create the new User entity and encode their password using BCrypt
        User user = User.builder()
                .email(registerDto.getEmail())
                .password(passwordEncoder.encode(registerDto.getPassword()))
                .firstName(registerDto.getFirstName())
                .lastName(registerDto.getLastName())
                .roles(Collections.singleton(userRole))
                .build();

        userRepository.save(user);

        return "User registered successfully!";
    }

    @Override
    @Transactional
    public AuthResponseDto login(UserLoginRequestDto loginDto) {
        // 1. Authenticate user credentials via Spring AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDto.getEmail(),
                        loginDto.getPassword()
                )
        );

        // 2. Set authentication context in Spring Security ContextHolder
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Generate token and build Response DTO
        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponseDto.builder()
                .accessToken(jwt)
                .build();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public com.smartcart.api.domain.auth.dto.UserProfileResponseDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        java.util.Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(java.util.stream.Collectors.toSet());

        return com.smartcart.api.domain.auth.dto.UserProfileResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(roleNames)
                .build();
    }
}
