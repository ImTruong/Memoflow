package com.memoflow.memoflow.controller;

import com.memoflow.memoflow.dto.request.CreateFlashcardLearningLessonRequest;
import com.memoflow.memoflow.dto.request.UpdateFlashcardLearningLessonRequest;
import com.memoflow.memoflow.dto.response.ApiResponse;
import com.memoflow.memoflow.dto.response.FlashcardLessonDetailResponse;
import com.memoflow.memoflow.dto.response.FlashcardLessonResponse;
import com.memoflow.memoflow.dto.response.FlashcardLessonSummaryResponse;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.LearningLessonService;
import org.springframework.data.domain.Pageable;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class LearningLessonController {

    private final LearningLessonService learningLessonService;

    @PostMapping(value = "/learning-activities/{learningActivityId}/flashcard-lessons", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@securityService.isActivityExist(#learningActivityId)")
    public ResponseEntity<ApiResponse<FlashcardLessonResponse>> createFlashcardLesson(
            @PathVariable Long learningActivityId,
            @Valid @ModelAttribute CreateFlashcardLearningLessonRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        FlashcardLessonResponse response = learningLessonService.createFlashcardLesson(learningActivityId, request,
                userPrincipal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Flashcard lesson created successfully"));
    }

    @PutMapping(value = "/flashcard-lessons/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@securityService.isFlashcardLessonOwner(#id, #userPrincipal.id)")
    public ResponseEntity<ApiResponse<FlashcardLessonResponse>> updateFlashcardLesson(
            @PathVariable Long id,
            @Valid @ModelAttribute UpdateFlashcardLearningLessonRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        FlashcardLessonResponse response = learningLessonService.updateFlashcardLesson(id, request, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Flashcard lesson updated successfully"));
    }

    @GetMapping("/flashcard-lessons/{id}")
    @PreAuthorize("@securityService.canAccessFlashcardLesson(#id, #userPrincipal.id)")
    public ResponseEntity<ApiResponse<FlashcardLessonDetailResponse>> getFlashcardLessonDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        FlashcardLessonDetailResponse response = learningLessonService.getFlashcardLessonDetail(id, userPrincipal, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Flashcard lesson detail retrieved successfully"));
    }

    @DeleteMapping("/flashcard-lessons/{id}")
    @PreAuthorize("@securityService.isFlashcardLessonOwner(#id, #userPrincipal.id)")
    public ResponseEntity<ApiResponse<Void>> deleteFlashcardLesson(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        learningLessonService.deleteFlashcardLesson(id, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(null, "Flashcard lesson deleted successfully"));
    }

    @GetMapping("/flashcard-lessons/my")
    public ResponseEntity<ApiResponse<PageResponse<FlashcardLessonSummaryResponse>>> getMyFlashcardLessons(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        PageResponse<FlashcardLessonSummaryResponse> response = learningLessonService
                .getMyFlashcardLessons(userPrincipal, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "My flashcard lessons retrieved successfully"));
    }

    @GetMapping("/flashcard-lessons/community")
    public ResponseEntity<ApiResponse<PageResponse<FlashcardLessonSummaryResponse>>> getCommunityFlashcardLessons(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        PageResponse<FlashcardLessonSummaryResponse> response = learningLessonService
                .getCommunityFlashcardLessons(userPrincipal, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Community flashcard lessons retrieved successfully"));
    }
}
