package com.smartcart.api.domain.assistant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {

    @NotBlank(message = "Message content must not be blank")
    private String message;
}
