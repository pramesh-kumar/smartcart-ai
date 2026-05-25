package com.smartcart.api.domain.assistant;

import com.smartcart.api.domain.assistant.dto.ChatAssistantResponseDto;
import com.smartcart.api.domain.assistant.dto.ChatMessageDto;

public interface AiAssistantService {
    
    ChatAssistantResponseDto chat(String email, ChatMessageDto messageDto);
}
