package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.request.*;
import com.memoflow.memoflow.dto.response.*;
import org.springframework.web.multipart.MultipartFile;
import com.memoflow.memoflow.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

import java.io.IOException;
import java.util.List;

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

    ListeningLessonDetailResponse createListeningLesson(CreateListeningLessonRequest request,
                                                        List<MultipartFile> audios,
                                                        List<MultipartFile> images) throws IOException;

    ListeningLessonDetailResponse updateListeningLesson(Long id,
                                                        UpdateListeningLessonRequest request,
                                                        List<MultipartFile> audios,
                                                        List<MultipartFile> images) throws IOException;

    void deleteListeningLesson(Long id) throws IOException;

    PageResponse<BilingualResponse> searchBilingual(String keyword,
                                                    Pageable pageable,
                                                    String _sort,
                                                    String readFilter,
                                                    UserPrincipal userPrincipal);

    BilingualResponse getBilingualDetail(Long lessonId, Long userId);

    void markAsSeen(Long lessonId, UserPrincipal userPrincipal);

    BilingualResponse createBilingualLesson(CreateBilingualLessonRequest request, MultipartFile file);

    BilingualResponse updateBilingualLesson(Long id, CreateBilingualLessonRequest request, MultipartFile file);

    void deleteBilingualLesson(Long id);

    PageResponse<FlashcardLessonSummaryResponse> getAllFlashcardLessons(Pageable pageable);

    void deleteFlashcardLessonAdmin(Long id);

}
