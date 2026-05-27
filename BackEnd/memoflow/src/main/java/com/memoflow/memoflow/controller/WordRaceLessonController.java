package com.memoflow.memoflow.controller;

import com.memoflow.memoflow.dto.request.UpsertWordRaceLessonRequest;
import com.memoflow.memoflow.dto.response.ApiResponse;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.WordRaceLessonResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.WordRaceLessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
// Controller cung cap API quan ly va doc cau hinh man choi Word Race.
public class WordRaceLessonController {

    private final WordRaceLessonService wordRaceLessonService;

    // API admin tao man choi Word Race trong mot learning activity.
    @PostMapping("/learning-activities/{learningActivityId}/word-race-lessons")
    @PreAuthorize("@securityService.isActivityExist(#learningActivityId) and hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WordRaceLessonResponse>> createWordRaceLesson(
            @PathVariable Long learningActivityId,
            @Valid @RequestBody UpsertWordRaceLessonRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        WordRaceLessonResponse response = wordRaceLessonService.createLesson(learningActivityId, request, userPrincipal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Word Race lesson created successfully"));
    }

    // API admin cap nhat cau hinh man choi Word Race.
    @PutMapping("/word-race-lessons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WordRaceLessonResponse>> updateWordRaceLesson(
            @PathVariable Long id,
            @Valid @RequestBody UpsertWordRaceLessonRequest request) {
        WordRaceLessonResponse response = wordRaceLessonService.updateLesson(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Word Race lesson updated successfully"));
    }

    // API admin xoa man choi Word Race.
    @DeleteMapping("/word-race-lessons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteWordRaceLesson(@PathVariable Long id) {
        wordRaceLessonService.deleteLesson(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Word Race lesson deleted successfully"));
    }

    // API user lay danh sach man choi Word Race co phan trang.
    @GetMapping("/word-race-lessons")
    public ResponseEntity<ApiResponse<PageResponse<WordRaceLessonResponse>>> getWordRaceLessons(Pageable pageable) {
        PageResponse<WordRaceLessonResponse> response = wordRaceLessonService.getLessons(pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Word Race lessons retrieved successfully"));
    }

    // API user lay chi tiet cau hinh mot man choi Word Race.
    @GetMapping("/word-race-lessons/{id}")
    public ResponseEntity<ApiResponse<WordRaceLessonResponse>> getWordRaceLessonDetail(@PathVariable Long id) {
        WordRaceLessonResponse response = wordRaceLessonService.getLessonDetail(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Word Race lesson detail retrieved successfully"));
    }
}
