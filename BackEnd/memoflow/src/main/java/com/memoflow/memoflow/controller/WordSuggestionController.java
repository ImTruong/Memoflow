package com.memoflow.memoflow.controller;

import com.memoflow.memoflow.dto.response.ApiResponse;
import com.memoflow.memoflow.entity.FlashcardReview;
import com.memoflow.memoflow.repository.FlashcardReviewRepository;
import com.memoflow.memoflow.service.Word2VecService;
import com.memoflow.memoflow.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/suggestions")
@RequiredArgsConstructor
public class WordSuggestionController {

    private final Word2VecService word2VecService;
    private final FlashcardReviewRepository flashcardReviewRepository;

    @GetMapping("/recommended-words")
    public ResponseEntity<ApiResponse<List<String>>> getRecommendedWords() {
        // Get Current User ID from Security Context
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UserPrincipal)) {
            return ResponseEntity.ok(ApiResponse.success(List.of(), "User not found"));
        }
        Long userId = ((UserPrincipal) principal).getId();

        // Get 10 most recent reviews to find 5 unique words
        List<FlashcardReview> recentReviews = flashcardReviewRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);
        
        // Extract up to 5 unique word names
        List<String> learnedWords = recentReviews.stream()
                .map(fr -> fr.getWord().getName())
                .distinct()
                .limit(5)
                .collect(Collectors.toList());

        // Get up to 4 suggestions based on the mean vector of learned words
        List<String> suggestions = word2VecService.getSuggestions(learnedWords, 4);

        return ResponseEntity.ok(ApiResponse.success(suggestions, "Suggestions fetched successfully"));
    }
}
