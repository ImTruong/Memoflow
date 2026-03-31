package com.memoflow.memoflow.controller;

import com.memoflow.memoflow.dto.request.*;
import com.memoflow.memoflow.dto.response.*;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

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

    @PostMapping(value = "/learning-activities/{learningActivityId}/story-lessons", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@securityService.isActivityExist(#learningActivityId) and hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StoryLessonResponse>> createStoryLesson(
            @PathVariable Long learningActivityId,
            @Valid @RequestPart("payload") CreateStoryLearningLessonRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StoryLessonResponse response = learningLessonService.createStoryLesson(learningActivityId, request, image, userPrincipal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Story lesson created successfully"));
    }

    @PutMapping(value = "/story-lessons/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StoryLessonResponse>> updateStoryLesson(
            @PathVariable Long id,
            @Valid @RequestPart("payload") UpdateStoryLearningLessonRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StoryLessonResponse response = learningLessonService.updateStoryLesson(id, request, image, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Story lesson updated successfully"));
    }

    @DeleteMapping("/story-lessons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStoryLesson(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        learningLessonService.deleteStoryLesson(id, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(null, "Story lesson deleted successfully"));
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

    @GetMapping("/listening-lessons")
    public ResponseEntity<ApiResponse<PageResponse<ListeningLessonResponse>>> getListeningLessons(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam Long part,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        PageResponse<ListeningLessonResponse> response = learningLessonService
                .getListeningLessons(userPrincipal, part, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Listening lessons retrieved successfully"));
    }

    @GetMapping("/listening-lessons/{id}")
    public ResponseEntity<ApiResponse<ListeningLessonDetailResponse>> getLíteningLessonDetail(
            @PathVariable Long id) {
        ListeningLessonDetailResponse response = learningLessonService.getListeningLessonDetail(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Listening lesson detail retrieved successfully"));
    }

    @PostMapping("/listening-lessons/{id}/submit")
    public ResponseEntity<ApiResponse<Void>> submitListeningLesson(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody SubmitListeningLessonRequest request,
            @PathVariable Long id) {
        learningLessonService.submitListeningLesson(userPrincipal, id, request, true);
        return ResponseEntity.ok(ApiResponse.success(null, "Submit successfully"));
    }

    @PostMapping("/listening-lessons/{id}/draft")
    public ResponseEntity<ApiResponse<Void>> draftListeningLesson(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody SubmitListeningLessonRequest request,
            @PathVariable Long id) {
        learningLessonService.submitListeningLesson(userPrincipal, id, request, false);
        return ResponseEntity.ok(ApiResponse.success(null, "draft successfully"));
    }

    @GetMapping("/listening-lessons/{id}/submission")
    public ResponseEntity<ApiResponse<ListeningLessonSubmissionResponse>> getListeningSubmission(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        ListeningLessonSubmissionResponse response = learningLessonService.getListeningSubmission(userPrincipal, id);
        return ResponseEntity.ok(ApiResponse.success(response, "Listening lesson submission retrieved successfully"));
    }

    @GetMapping("/listening-lessons/{id}/result")
    public ResponseEntity<ApiResponse<ListeningResultResponse>> getListeningResult(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        ListeningResultResponse response = learningLessonService.getListeningResult(userPrincipal, id);
        return ResponseEntity.ok(ApiResponse.success(response, "Listening result retrieved successfully"));
    }

    @PostMapping(path = "/listening-lessons", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ListeningLessonDetailResponse>> createLesson(
            @RequestPart("lesson") CreateListeningLessonRequest request,
            @RequestPart(value = "audios", required = false) List<MultipartFile> audios,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        ListeningLessonDetailResponse response = learningLessonService.createListeningLesson(request, audios, images);
        return ResponseEntity.ok(ApiResponse.success(response, "Listening lesson created successfully"));
    }

    @PutMapping(path = "/listening-lessons/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ListeningLessonDetailResponse>> updateLesson(
            @PathVariable Long id,
            @RequestPart("lesson") UpdateListeningLessonRequest request,
            @RequestPart(value = "audios", required = false) List<MultipartFile> audios,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {

        ListeningLessonDetailResponse response = learningLessonService.updateListeningLesson(id, request, audios, images);
        return ResponseEntity.ok(ApiResponse.success(response, "Listening lesson updated successfully"));
    }

    @DeleteMapping("/listening-lessons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteListeningLesson(@PathVariable Long id) throws IOException {
        learningLessonService.deleteListeningLesson(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Listening lesson deleted successfully"));
    }

    @GetMapping("/bilingual")
    public ResponseEntity<ApiResponse<PageResponse<BilingualResponse>>> searchBilingual(
            @RequestParam String keyword,
            @RequestParam String filter,
            Pageable pageable) {
        PageResponse<BilingualResponse> response = learningLessonService.searchBilingual(keyword, pageable, filter);
        return ResponseEntity.ok(ApiResponse.success(response, "Bilingual lessons retrieved successfully"));
    }

    @GetMapping("/bilingual/{id}")
    public ResponseEntity<ApiResponse<BilingualResponse>> searchBilingual(
            @PathVariable Long id) {
        BilingualResponse response = learningLessonService.getBilingualById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Bilingual lesson detail retrieved successfully"));
    }

    @PostMapping("/bilingual/{id}/seen")
    public ResponseEntity<ApiResponse<Void>> markLessonAsSeen(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        learningLessonService.markAsSeen(id, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(null, "Lesson marked as seen"));
    }

    @PostMapping(path = "/bilingual", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BilingualResponse>> createBilingualLesson(
            @RequestPart("lesson") CreateBilingualLessonRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        BilingualResponse response = learningLessonService.createBilingualLesson(request, file);
        return ResponseEntity.ok(ApiResponse.success(response, "Bilingual lesson created successfully"));
    }

    @PutMapping(path = "/bilingual/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BilingualResponse>> updateBilingualLesson(
            @PathVariable Long id,
            @RequestPart("lesson") CreateBilingualLessonRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        BilingualResponse response = learningLessonService.updateBilingualLesson(id, request, file);
        return ResponseEntity.ok(ApiResponse.success(response, "Bilingual lesson created successfully"));
    }

    @DeleteMapping("/bilingual/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteLesson(@PathVariable Long id) {
        learningLessonService.deleteBilingualLesson(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Bilingual lesson deleted successfully"));
    }

    @GetMapping("/story-lessons")
    public ResponseEntity<ApiResponse<PageResponse<StoryLessonProgressResponse>>> getStoryLessons(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        PageResponse<StoryLessonProgressResponse> response = learningLessonService.getStoryLessons(userPrincipal, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Story lessons retrieved successfully"));
    }

    @GetMapping("/story-lessons/{id}")
    public ResponseEntity<ApiResponse<StoryLessonProgressResponse>> getStoryLessonDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StoryLessonProgressResponse response = learningLessonService.getStoryLessonDetail(id, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Story lesson detail retrieved successfully"));
    }

    @PostMapping("/story-lessons/{id}/complete")
    public ResponseEntity<ApiResponse<Void>> completeStoryLesson(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        learningLessonService.completeStoryLesson(id, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(null, "Story lesson completed"));
    }
}
