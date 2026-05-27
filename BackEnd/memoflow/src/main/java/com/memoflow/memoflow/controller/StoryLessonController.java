package com.memoflow.memoflow.controller;

import com.memoflow.memoflow.dto.request.CreateStoryLearningLessonRequest;
import com.memoflow.memoflow.dto.request.UpdateStoryLearningLessonRequest;
import com.memoflow.memoflow.dto.response.ApiResponse;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.StoryLessonProgressResponse;
import com.memoflow.memoflow.dto.response.StoryLessonResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.StoryLessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
// Controller cung cap API quan ly truyen chem va tien do doc cua user.
public class StoryLessonController {

    private final StoryLessonService storyLessonService;

    // API admin tao truyen chem, nhan payload JSON va anh minh hoa dang multipart.
    @PostMapping(value = "/learning-activities/{learningActivityId}/story-lessons", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@securityService.isActivityExist(#learningActivityId) and hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StoryLessonResponse>> createStoryLesson(
            @PathVariable Long learningActivityId,
            @Valid @RequestPart("payload") CreateStoryLearningLessonRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StoryLessonResponse response = storyLessonService.createLesson(learningActivityId, request, image, userPrincipal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Story lesson created successfully"));
    }

    // API admin cap nhat truyen chem, co the thay anh minh hoa neu gui file moi.
    @PutMapping(value = "/story-lessons/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StoryLessonResponse>> updateStoryLesson(
            @PathVariable Long id,
            @Valid @RequestPart("payload") UpdateStoryLearningLessonRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StoryLessonResponse response = storyLessonService.updateLesson(id, request, image, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Story lesson updated successfully"));
    }

    // API admin xoa truyen chem theo id.
    @DeleteMapping("/story-lessons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStoryLesson(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        storyLessonService.deleteLesson(id, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(null, "Story lesson deleted successfully"));
    }

    // API user lay danh sach truyen chem kem tien do doc.
    @GetMapping("/story-lessons")
    public ResponseEntity<ApiResponse<PageResponse<StoryLessonProgressResponse>>> getStoryLessons(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        PageResponse<StoryLessonProgressResponse> response = storyLessonService.getLessons(userPrincipal, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Story lessons retrieved successfully"));
    }

    // API user lay chi tiet truyen chem kem tien do doc.
    @GetMapping("/story-lessons/{id}")
    public ResponseEntity<ApiResponse<StoryLessonProgressResponse>> getStoryLessonDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StoryLessonProgressResponse response = storyLessonService.getLessonDetail(id, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Story lesson detail retrieved successfully"));
    }

    // API user danh dau da hoan thanh truyen chem.
    @PostMapping("/story-lessons/{id}/complete")
    public ResponseEntity<ApiResponse<Void>> completeStoryLesson(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        storyLessonService.completeLesson(id, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(null, "Story lesson completed"));
    }
}
