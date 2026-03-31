package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.request.UpdateWordHuntProgressRequest;
import com.memoflow.memoflow.dto.request.UpsertWordHuntLessonRequest;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.WordHuntLessonResponse;
import com.memoflow.memoflow.dto.response.WordHuntProgressResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

public interface WordHuntLessonService {

    WordHuntLessonResponse createLesson(Long learningActivityId, UpsertWordHuntLessonRequest request, UserPrincipal userPrincipal);

    WordHuntLessonResponse updateLesson(Long lessonId, UpsertWordHuntLessonRequest request);

    void deleteLesson(Long lessonId);

    PageResponse<WordHuntProgressResponse> getLessons(UserPrincipal userPrincipal, Pageable pageable);

    WordHuntProgressResponse getLessonDetail(Long lessonId, UserPrincipal userPrincipal);

    WordHuntProgressResponse updateProgress(Long lessonId, UpdateWordHuntProgressRequest request, UserPrincipal userPrincipal);
}
