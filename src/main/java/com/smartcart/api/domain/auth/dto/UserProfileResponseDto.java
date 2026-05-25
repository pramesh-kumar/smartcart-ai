package com.smartcart.api.domain.auth.dto;

import lombok.*;

import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponseDto {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private Set<String> roles;
}
