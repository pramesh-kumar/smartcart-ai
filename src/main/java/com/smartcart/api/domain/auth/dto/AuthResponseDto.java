package com.smartcart.api.domain.auth.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDto {
    
    private String accessToken;
    
    @Builder.Default
    private String tokenType = "Bearer";
}
