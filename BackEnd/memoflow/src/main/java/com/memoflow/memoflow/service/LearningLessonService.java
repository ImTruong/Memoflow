package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.request.CreateFlashcardLearningLessonRequest;
import com.memoflow.memoflow.dto.request.UpdateFlashcardLearningLessonRequest;
import com.memoflow.memoflow.dto.response.FlashcardLessonDetailResponse;
import com.memoflow.memoflow.dto.response.FlashcardLessonResponse;
import com.memoflow.memoflow.dto.response.FlashcardLessonSummaryResponse;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

public interface LearningLessonService {

    FlashcardLessonResponse createFlashcardLesson(Long learningActivityId, CreateFlashcardLearningLessonRequest request, UserPrincipal userPrincipal);

    FlashcardLessonResponse updateFlashcardLesson(Long id, UpdateFlashcardLearningLessonRequest request, UserPrincipal userPrincipal);
    
    void deleteFlashcardLesson(Long id, UserPrincipal userPrincipal);

    PageResponse<FlashcardLessonSummaryResponse> getMyFlashcardLessons(UserPrincipal userPrincipal, Pageable pageable);

    PageResponse<FlashcardLessonSummaryResponse> getCommunityFlashcardLessons(UserPrincipal userPrincipal, Pageable pageable);
    
    FlashcardLessonDetailResponse getFlashcardLessonDetail(Long id, UserPrincipal userPrincipal, Pageable pageable);

}
