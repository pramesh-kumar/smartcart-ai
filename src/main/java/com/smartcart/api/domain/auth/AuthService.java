package com.smartcart.api.domain.auth;

import com.smartcart.api.domain.auth.dto.AuthResponseDto;
import com.smartcart.api.domain.auth.dto.UserLoginRequestDto;
import com.smartcart.api.domain.auth.dto.UserRegisterRequestDto;
import com.smartcart.api.domain.auth.dto.UserProfileResponseDto;

public interface AuthService {
    
    String register(UserRegisterRequestDto registerDto);
    
    AuthResponseDto login(UserLoginRequestDto loginDto);

    UserProfileResponseDto getProfile(String email);
}
