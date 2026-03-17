package com.memoflow.memoflow.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

import com.memoflow.memoflow.dto.request.CreateWordRequest;
import com.memoflow.memoflow.dto.request.UpdateWordRequest;
import com.memoflow.memoflow.dto.response.ApiResponse;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.WordResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.WordService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class WordController {

    private final WordService wordService;

    @PostMapping(value = "/flashcard-lessons/{flashcardLessonId}/words", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@securityService.isFlashcardLessonOwner(#flashcardLessonId, #userPrincipal.id)")
    public ResponseEntity<ApiResponse<WordResponse>> createWord(
            @PathVariable Long flashcardLessonId,
            @Valid @ModelAttribute CreateWordRequest createWordRequest,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        WordResponse wordResponse = wordService.createWord(flashcardLessonId, createWordRequest, userPrincipal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(wordResponse, "Word created successfully"));
    }

    @PutMapping(value = "/words/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@securityService.isWordOwner(#id, #userPrincipal.id)")
    public ResponseEntity<ApiResponse<WordResponse>> updateWord(
            @PathVariable Long id,
            @Valid @ModelAttribute UpdateWordRequest updateWordRequest,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        WordResponse wordResponse = wordService.updateWord(id, updateWordRequest, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(wordResponse, "Word updated successfully"));
    }

    @GetMapping("/flashcard-lessons/{flashcardLessonId}/words")
    @PreAuthorize("@securityService.canAccessFlashcardLesson(#flashcardLessonId, #userPrincipal.id)")
    public ResponseEntity<ApiResponse<PageResponse<WordResponse>>> getWordsByFlashcardLessonId(
            @PathVariable Long flashcardLessonId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String keyword,
            Pageable pageable,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PageResponse<WordResponse> words;
        if (keyword != null && !keyword.isEmpty()) {
            words = wordService.searchWordsInLesson(flashcardLessonId, keyword, pageable, userPrincipal);
        } else {
            words = wordService.getWordsByFlashcardLessonId(flashcardLessonId, pageable, userPrincipal);
        }
        return ResponseEntity.ok(ApiResponse.success(words, "Words retrieved successfully"));
    }

    @DeleteMapping("/words/{id}")
    @PreAuthorize("@securityService.isWordOwner(#id, #userPrincipal.id)")
    public ResponseEntity<ApiResponse<Void>> deleteWord(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        wordService.deleteWord(id, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(null, "Word deleted successfully"));
    }
 
    @GetMapping("/flashcard-lessons/{flashcardLessonId}/due-words")
    @PreAuthorize("@securityService.canAccessFlashcardLesson(#flashcardLessonId, #userPrincipal.id)")
    public ResponseEntity<ApiResponse<PageResponse<WordResponse>>> getDueWordsByFlashcardLessonId(
            @PathVariable Long flashcardLessonId,
            Pageable pageable,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PageResponse<WordResponse> words = wordService.getDueWordsByFlashcardLessonId(flashcardLessonId, pageable, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(words, "Due words retrieved successfully"));
    }

    @GetMapping("/words/due")
    public ResponseEntity<ApiResponse<PageResponse<WordResponse>>> getDueWordsForUser(
            Pageable pageable,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PageResponse<WordResponse> words = wordService.getDueWordsForUser(pageable, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(words, "All due words retrieved successfully"));
    }
}
