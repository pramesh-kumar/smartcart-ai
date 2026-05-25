package com.smartcart.api.domain.assistant;

import com.smartcart.api.domain.assistant.dto.ChatAssistantResponseDto;
import com.smartcart.api.domain.assistant.dto.ChatMessageDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/assistant")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Conversational AI Assistant", description = "Endpoints for the intelligent conversational shopping assistant")
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;

    @PostMapping("/chat")
    @Operation(summary = "Chat with the AI Shopping Assistant", description = "Accepts a natural language query from the user, dynamically extracts budget, category, and intent preferences using Regex NLP semantic parsing, queries the recommendation engine, and returns a conversational response with dynamic follow-up options.")
    @ApiResponse(responseCode = "200", description = "Successful calculation")
    @ApiResponse(responseCode = "401", description = "User is unauthenticated")
    public ResponseEntity<ChatAssistantResponseDto> chat(
            Authentication authentication,
            @Valid @RequestBody ChatMessageDto messageDto) {
        
        String email = authentication.getName();
        ChatAssistantResponseDto response = aiAssistantService.chat(email, messageDto);
        return ResponseEntity.ok(response);
    }
}
