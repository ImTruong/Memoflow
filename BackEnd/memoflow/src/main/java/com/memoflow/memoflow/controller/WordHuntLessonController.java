package com.memoflow.memoflow.controller;

import com.memoflow.memoflow.dto.request.UpdateWordHuntProgressRequest;
import com.memoflow.memoflow.dto.request.UpsertWordHuntLessonRequest;
import com.memoflow.memoflow.dto.response.ApiResponse;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.WordHuntLessonResponse;
import com.memoflow.memoflow.dto.response.WordHuntProgressResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.WordHuntLessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
// Controller cung cap API quan ly Word Hunt va cap nhat tien do choi cua user.
public class WordHuntLessonController {

    private final WordHuntLessonService wordHuntLessonService;

    // API admin tao man choi Word Hunt trong mot learning activity.
    @PostMapping("/learning-activities/{learningActivityId}/word-hunt-lessons")
    @PreAuthorize("@securityService.isActivityExist(#learningActivityId) and hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WordHuntLessonResponse>> createWordHuntLesson(
            @PathVariable Long learningActivityId,
            @Valid @RequestBody UpsertWordHuntLessonRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        WordHuntLessonResponse response = wordHuntLessonService.createLesson(learningActivityId, request, userPrincipal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Word Hunt lesson created successfully"));
    }

    // API admin cap nhat cau hinh man choi Word Hunt.
    @PutMapping("/word-hunt-lessons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WordHuntLessonResponse>> updateWordHuntLesson(
            @PathVariable Long id,
            @Valid @RequestBody UpsertWordHuntLessonRequest request) {
        WordHuntLessonResponse response = wordHuntLessonService.updateLesson(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Word Hunt lesson updated successfully"));
    }

    // API admin xoa man choi Word Hunt.
    @DeleteMapping("/word-hunt-lessons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteWordHuntLesson(@PathVariable Long id) {
        wordHuntLessonService.deleteLesson(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Word Hunt lesson deleted successfully"));
    }

    // API user lay danh sach man Word Hunt kem tien do hien tai.
    @GetMapping("/word-hunt-lessons")
    public ResponseEntity<ApiResponse<PageResponse<WordHuntProgressResponse>>> getWordHuntLessons(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        PageResponse<WordHuntProgressResponse> response = wordHuntLessonService.getLessons(userPrincipal, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Word Hunt lessons retrieved successfully"));
    }

    // API user lay chi tiet mot man Word Hunt kem tien do hien tai.
    @GetMapping("/word-hunt-lessons/{id}")
    public ResponseEntity<ApiResponse<WordHuntProgressResponse>> getWordHuntLessonDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        WordHuntProgressResponse response = wordHuntLessonService.getLessonDetail(id, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Word Hunt lesson detail retrieved successfully"));
    }

    // API user gui tien do sau khi thang, het gio hoac thoat game.
    @PostMapping("/word-hunt-lessons/{id}/progress")
    public ResponseEntity<ApiResponse<WordHuntProgressResponse>> updateWordHuntProgress(
            @PathVariable Long id,
            @Valid @RequestBody UpdateWordHuntProgressRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        WordHuntProgressResponse response = wordHuntLessonService.updateProgress(id, request, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Word Hunt progress updated successfully"));
    }
}
