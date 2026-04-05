package com.memoflow.memoflow.controller;

import com.memoflow.memoflow.dto.request.*;
import com.memoflow.memoflow.dto.response.*;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.LearningLessonService;
import com.memoflow.memoflow.util.ExcelUtil;
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
    private final ExcelUtil excelUtil;

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

    @PostMapping(path = "/listening-lessons/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> uploadLesson(
            @RequestPart("excel") MultipartFile excelFile) throws IOException {
        List<CreateListeningLessonRequest.ListeningGroupRequest> response = excelUtil.parseToListeningGroup(excelFile);
        return ResponseEntity.ok(ApiResponse.success(response, "Listening lesson excel uploaded successfully"));
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
            @RequestParam String _sort,
            @RequestParam String readFilter,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        PageResponse<BilingualResponse> response = learningLessonService.searchBilingual(keyword,
                pageable,
                _sort,
                readFilter,
                userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Bilingual lessons retrieved successfully"));
    }

    @GetMapping("/bilingual/{id}")
    public ResponseEntity<ApiResponse<BilingualResponse>> searchBilingual(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        BilingualResponse response = learningLessonService.getBilingualDetail(id, userPrincipal.getId());
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

    @PostMapping(path = "/bilingual/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> uploadBilingualLesson(
            @RequestPart("excel") MultipartFile excelFile) throws IOException {
        List<CreateBilingualLessonRequest.Paragraph> response = excelUtil.parseToBilingualParagraphs(excelFile);
        return ResponseEntity.ok(ApiResponse.success(response, "Bilingual excel uploaded successfully"));
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
        @GetMapping("/grammar/topics")
        public ResponseEntity<ApiResponse<List<GrammarTopicResponse>>> getGrammarTopics(
                @AuthenticationPrincipal UserPrincipal userPrincipal) {
            List<GrammarTopicResponse> response = learningLessonService.getGrammarTopics(userPrincipal);
            return ResponseEntity.ok(ApiResponse.success(response, "Grammar topics retrieved successfully"));
        }
    
        @GetMapping("/grammar/topics/{topicId}")
        public ResponseEntity<ApiResponse<GrammarTopicDetailResponse>> getGrammarTopicDetail(
                @PathVariable Long topicId,
                @AuthenticationPrincipal UserPrincipal userPrincipal) {
            GrammarTopicDetailResponse response = learningLessonService.getGrammarTopicDetail(topicId, userPrincipal);
            return ResponseEntity.ok(ApiResponse.success(response, "Grammar topic detail retrieved successfully"));
        }
    
        @GetMapping("/grammar/lessons/{lessonId}")
        public ResponseEntity<ApiResponse<GrammarLessonDetailResponse>> getGrammarLessonDetail(
                @PathVariable Long lessonId,
                @AuthenticationPrincipal UserPrincipal userPrincipal) {
            GrammarLessonDetailResponse response = learningLessonService.getGrammarLessonDetail(lessonId, userPrincipal);
            return ResponseEntity.ok(ApiResponse.success(response, "Grammar lesson detail retrieved successfully"));
        }
    
        @GetMapping("/grammar/practices")
        public ResponseEntity<ApiResponse<List<GrammarPracticeOverviewResponse>>> getGrammarPracticeOverview(
                @AuthenticationPrincipal UserPrincipal userPrincipal) {
            List<GrammarPracticeOverviewResponse> response = learningLessonService.getGrammarPracticeOverview(userPrincipal);
            return ResponseEntity.ok(ApiResponse.success(response, "Grammar practice overview retrieved successfully"));
        }
    
        @GetMapping("/grammar/practices/{practiceId}")
        public ResponseEntity<ApiResponse<GrammarPracticeDetailResponse>> getGrammarPracticeDetail(
                @PathVariable Long practiceId,
                @AuthenticationPrincipal UserPrincipal userPrincipal) {
            GrammarPracticeDetailResponse response = learningLessonService.getGrammarPracticeDetail(practiceId, userPrincipal);
            return ResponseEntity.ok(ApiResponse.success(response, "Grammar practice detail retrieved successfully"));
        }
    
        @GetMapping("/grammar/practices/{practiceId}/quiz")
        public ResponseEntity<ApiResponse<GrammarPracticeQuizResponse>> getGrammarPracticeQuiz(
                @PathVariable Long practiceId) {
            GrammarPracticeQuizResponse response = learningLessonService.getGrammarPracticeQuiz(practiceId);
            return ResponseEntity.ok(ApiResponse.success(response, "Grammar practice quiz retrieved successfully"));
        }
    
        @PostMapping("/grammar/practices/{practiceId}/submit")
        public ResponseEntity<ApiResponse<Void>> submitGrammarPractice(
                @PathVariable Long practiceId,
                @RequestBody SubmitGrammarPracticeRequest request,
                @AuthenticationPrincipal UserPrincipal userPrincipal) {
            learningLessonService.submitGrammarPractice(userPrincipal, practiceId, request, true);
            return ResponseEntity.ok(ApiResponse.success(null, "Submit successfully"));
        }
    
        @PostMapping("/grammar/practices/{practiceId}/draft")
        public ResponseEntity<ApiResponse<Void>> draftGrammarPractice(
                @PathVariable Long practiceId,
                @RequestBody SubmitGrammarPracticeRequest request,
                @AuthenticationPrincipal UserPrincipal userPrincipal) {
            learningLessonService.submitGrammarPractice(userPrincipal, practiceId, request, false);
            return ResponseEntity.ok(ApiResponse.success(null, "Draft saved successfully"));
        }
    
        @GetMapping("/grammar/practices/{practiceId}/submission")
        public ResponseEntity<ApiResponse<GrammarPracticeSubmissionResponse>> getGrammarPracticeSubmission(
                @PathVariable Long practiceId,
                @AuthenticationPrincipal UserPrincipal userPrincipal) {
            GrammarPracticeSubmissionResponse response = learningLessonService.getGrammarPracticeSubmission(userPrincipal, practiceId);
            return ResponseEntity.ok(ApiResponse.success(response, "Grammar submission retrieved successfully"));
        }
    
        @GetMapping("/grammar/practices/{practiceId}/result")
        public ResponseEntity<ApiResponse<GrammarPracticeResultResponse>> getGrammarPracticeResult(
                @PathVariable Long practiceId,
                @AuthenticationPrincipal UserPrincipal userPrincipal) {
            GrammarPracticeResultResponse response = learningLessonService.getGrammarPracticeResult(userPrincipal, practiceId);
            return ResponseEntity.ok(ApiResponse.success(response, "Grammar result retrieved successfully"));
        }
}
