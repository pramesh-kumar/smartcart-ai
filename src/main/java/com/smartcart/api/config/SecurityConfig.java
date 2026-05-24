package com.smartcart.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

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
                
                // Future public auth endpoints (Register, Login, etc.)
                .requestMatchers("/api/v1/auth/**").permitAll()
                
                // Any other request in the application must be authenticated
                .anyRequest().authenticated()
            )
            
            // 3. Configure stateless session management (no HTTP Sessions)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );

        return http.build();
    }
}
