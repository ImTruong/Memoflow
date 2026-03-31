package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.request.CreateFlashcardLearningLessonRequest;
import com.memoflow.memoflow.dto.request.SubmitListeningLessonRequest;
import com.memoflow.memoflow.dto.request.UpdateFlashcardLearningLessonRequest;
import com.memoflow.memoflow.dto.response.*;
import com.memoflow.memoflow.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

public interface LearningLessonService {

    FlashcardLessonResponse createFlashcardLesson(Long learningActivityId, CreateFlashcardLearningLessonRequest request, UserPrincipal userPrincipal);

    FlashcardLessonResponse updateFlashcardLesson(Long id, UpdateFlashcardLearningLessonRequest request, UserPrincipal userPrincipal);
    
    void deleteFlashcardLesson(Long id, UserPrincipal userPrincipal);

    PageResponse<FlashcardLessonSummaryResponse> getMyFlashcardLessons(UserPrincipal userPrincipal, Pageable pageable);

    PageResponse<FlashcardLessonSummaryResponse> getCommunityFlashcardLessons(UserPrincipal userPrincipal, Pageable pageable);
    
    FlashcardLessonDetailResponse getFlashcardLessonDetail(Long id, UserPrincipal userPrincipal, Pageable pageable);

    PageResponse<ListeningLessonResponse> getListeningLessons(UserPrincipal userPrincipal, Long part, String status, Pageable pageable);

    ListeningLessonDetailResponse getListeningLessonDetail(Long lessonId);

    void submitListeningLesson(UserPrincipal userPrincipal, Long lessonId, SubmitListeningLessonRequest request, boolean isCompleted);

    ListeningLessonSubmissionResponse getListeningSubmission(UserPrincipal userPrincipal, Long lessonId);

    ListeningResultResponse getListeningResult(UserPrincipal userPrincipal, Long lessonId);

    PageResponse<BilingualResponse> searchBilingual(String keyword, Pageable pageable,String filter);

    BilingualResponse getBilingualById(Long id);

    void markAsSeen(Long lessonId, UserPrincipal userPrincipal);

}
