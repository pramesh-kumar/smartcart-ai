package com.smartcart.api.domain.assistant.dto;

import com.smartcart.api.domain.recommendation.dto.RecommendationResponseDto;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatAssistantResponseDto {
    private String reply;
    private Map<String, Object> extractedPreferences;
    private List<RecommendationResponseDto> recommendations;
    private List<String> suggestedFollowUps;
}
