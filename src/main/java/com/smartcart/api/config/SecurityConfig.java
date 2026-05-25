package com.smartcart.api.config;

import com.smartcart.api.domain.auth.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Essential for unlocking @PreAuthorize checks at the controller level
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Enforce BCrypt password hashing (minimum 10 rounds is standard/secure)
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        // Expose AuthenticationManager Bean globally to allow our AuthService to handle manual credential checking
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Disable CSRF (Cross-Site Request Forgery) since we are building stateless JWT REST APIs
            .csrf(AbstractHttpConfigurer::disable)
            
            // 2. Set up endpoint authorization rules
            .authorizeHttpRequests(auth -> auth
                // Allow unauthenticated access to health check
                .requestMatchers("/api/v1/health").permitAll()
                
                // Allow unauthenticated access to OpenAPI / Swagger documentation
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/api-docs/**").permitAll()
                
                // Expose registration & login publicly
                .requestMatchers("/api/v1/auth/**").permitAll()
                
                // Any other request in the application must be authenticated
                .anyRequest().authenticated()
            )
            
            // 3. Configure stateless session management (no HTTP Sessions)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // 4. Inject our custom JWT Authentication Filter before the default UsernamePassword filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
