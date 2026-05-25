package com.smartcart.api.domain.assistant;

import com.smartcart.api.domain.assistant.dto.ChatAssistantResponseDto;
import com.smartcart.api.domain.assistant.dto.ChatMessageDto;
import com.smartcart.api.domain.category.Category;
import com.smartcart.api.domain.category.CategoryRepository;
import com.smartcart.api.domain.recommendation.RecommendationService;
import com.smartcart.api.domain.recommendation.dto.RecommendationRequestDto;
import com.smartcart.api.domain.recommendation.dto.RecommendationResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiAssistantServiceImpl implements AiAssistantService {

    private final RecommendationService recommendationService;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public ChatAssistantResponseDto chat(String email, ChatMessageDto messageDto) {
        String userQuery = messageDto.getMessage();

        // 1. NLP Preference Extraction
        BigDecimal maxPrice = extractBudget(userQuery);
        Category categoryMatch = extractCategory(userQuery);
        String intent = extractIntent(userQuery);

        // 2. Query Recommendation Engine using parsed configurations
        RecommendationRequestDto requestDto = RecommendationRequestDto.builder()
                .maxPrice(maxPrice)
                .categoryId(categoryMatch != null ? categoryMatch.getId() : null)
                .intent(intent)
                .build();

        List<RecommendationResponseDto> recommendations = recommendationService.getRecommendations(email, requestDto);

        // 3. Construct Conversational Flow & Explanation
        String reply;
        List<String> followUps = new ArrayList<>();
        Map<String, Object> extractedPrefs = new HashMap<>();
        
        extractedPrefs.put("maxPrice", maxPrice != null ? maxPrice : "None");
        extractedPrefs.put("category", categoryMatch != null ? categoryMatch.getName() : "None");
        extractedPrefs.put("intent", intent != null ? intent : "None");

        if (recommendations.isEmpty()) {
            reply = "Hello! I searched our product catalog for your request, but I couldn't find any products matching those parameters. " +
                    "Would you like to try searching for another category or adjusting your budget limit?";
            
            followUps.add("Show me items under $500");
            followUps.add("Suggest something in Electronics");
            followUps.add("What products are highly-rated?");
        } else {
            RecommendationResponseDto topPick = recommendations.get(0);
            
            // Build conversational greeting and reasoning
            StringBuilder sb = new StringBuilder();
            sb.append("Hi there! Based on your request, ");
            
            List<String> prefText = new ArrayList<>();
            if (maxPrice != null) prefText.add("a budget limit under $" + maxPrice);
            if (categoryMatch != null) prefText.add("items in '" + categoryMatch.getName() + "'");
            if (intent != null) prefText.add("preferences for '" + intent + "'");
            
            sb.append("I've extracted your preference for ").append(String.join(", and ", prefText)).append(".\n\n");
            sb.append("My top recommendation for you is the **").append(topPick.getProductName()).append("** ");
            sb.append(String.format("priced at **$%.2f**.\n\n", topPick.getPrice().doubleValue()));
            sb.append("**Reason:** ").append(topPick.getReason()).append("\n\n");
            
            if (recommendations.size() > 1) {
                sb.append("I also found ").append(recommendations.size() - 1).append(" other great match(es) for you.");
            }
            
            reply = sb.toString();

            // 4. Generate dynamic follow-up questions
            followUps.add(String.format("Would you like me to add '%s' directly to your shopping cart?", topPick.getProductName()));
            followUps.add(String.format("Show me other highly-rated items in the '%s' category", 
                    categoryMatch != null ? categoryMatch.getName() : "Electronics"));
            followUps.add(String.format("What are the customer reviews for '%s'?", topPick.getProductName()));
        }

        return ChatAssistantResponseDto.builder()
                .reply(reply)
                .extractedPreferences(extractedPrefs)
                .recommendations(recommendations)
                .suggestedFollowUps(followUps)
                .build();
    }

    // --- NLP Regular Expression Preference Extractor Utility Methods ---

    private BigDecimal extractBudget(String input) {
        if (input == null || input.isBlank()) return null;
        
        // Regex looks for numbers immediately preceded or succeeded by currency symbols or under/below keywords
        String regex = "(?:under|below|less than|rs\\.?|₹|\\$)\\s*(\\d+(?:\\.\\d{2})?)";
        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(input);
        
        if (matcher.find()) {
            try {
                return new BigDecimal(matcher.group(1));
            } catch (Exception ex) {
                return null;
            }
        }
        return null;
    }

    private Category extractCategory(String input) {
        if (input == null || input.isBlank()) return null;
        
        try {
            List<Category> categories = categoryRepository.findAll();
            String inputLower = input.toLowerCase(Locale.ROOT);
            
            for (Category category : categories) {
                // If query contains the category name (e.g. "electronics") or its slug
                if (inputLower.contains(category.getName().toLowerCase(Locale.ROOT)) || 
                    inputLower.contains(category.getSlug().toLowerCase(Locale.ROOT))) {
                    return category;
                }
            }
        } catch (Exception ex) {
            // Safe fallback
        }
        return null;
    }

    private String extractIntent(String input) {
        if (input == null || input.isBlank()) return null;
        
        String inputLower = input.toLowerCase(Locale.ROOT);
        
        // Match key interest nouns/adjectives
        String[] keywords = {"gaming", "coding", "office", "wireless", "portable", "noise-cancelling", "music", "developer"};
        for (String keyword : keywords) {
            if (inputLower.contains(keyword)) {
                return keyword;
            }
        }
        
        // Fallback: extract last word as intent if no category matches
        String[] words = input.trim().split("\\s+");
        if (words.length > 0) {
            return words[words.length - 1].replaceAll("[^a-zA-Z]", "");
        }
        
        return null;
    }
}
