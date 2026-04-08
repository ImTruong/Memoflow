package com.memoflow.memoflow.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.memoflow.memoflow.dto.response.ApiResponse;
import com.memoflow.memoflow.dto.response.FlashcardLessonDetailResponse;
import com.memoflow.memoflow.dto.response.FlashcardLessonSummaryResponse;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.UserResponse;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.service.LearningLessonService;
import com.memoflow.memoflow.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final LearningLessonService learningLessonService;
    private final ModelMapper modelMapper;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<User> users = userService.findAll();
        List<UserResponse> responses = users.stream()
                .map(user -> {
                    UserResponse res = modelMapper.map(user, UserResponse.class);
                    if (user.getAvatar() != null) {
                        res.setAvatar(user.getAvatar().getUrl());
                    }
                    if (user.getRole() != null) {
                        res.setRole(user.getRole().getName());
                    }
                    return res;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses, "Users retrieved successfully"));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> changeUserRole(
            @PathVariable Long id,
            @RequestParam Long roleId) {
        UserResponse response = userService.changeRole(id, roleId);
        return ResponseEntity.ok(ApiResponse.success(response, "User role updated successfully"));
    }

    @PutMapping("/users/{id}/password")
    public ResponseEntity<ApiResponse<String>> changeUserPassword(
            @PathVariable Long id,
            @RequestParam String newPassword) {
        userService.changePassword(id, newPassword);
        return ResponseEntity.ok(ApiResponse.success(null, "User password updated successfully"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }

    // Vocabulary Management
    @GetMapping("/flashcard-lessons")
    public ResponseEntity<ApiResponse<PageResponse<FlashcardLessonSummaryResponse>>> getAllFlashcards(Pageable pageable) {
        // We'll need to implement this in Service
        PageResponse<FlashcardLessonSummaryResponse> response = learningLessonService.getAllFlashcardLessons(pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "All flashcard lessons retrieved"));
    }

    @DeleteMapping("/flashcard-lessons/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFlashcard(@PathVariable Long id) {
        learningLessonService.deleteFlashcardLessonAdmin(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Flashcard lesson deleted"));
    }

    @GetMapping("/flashcard-lessons/{id}")
    public ResponseEntity<ApiResponse<FlashcardLessonDetailResponse>> getFlashcardDetail(@PathVariable Long id, Pageable pageable) {
        // Admin can access any lesson detail
        FlashcardLessonDetailResponse response = learningLessonService.getFlashcardLessonDetail(id, null, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Flashcard lesson detail retrieved"));
    }
}
