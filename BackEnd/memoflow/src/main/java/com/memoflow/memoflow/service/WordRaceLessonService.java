package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.request.UpsertWordRaceLessonRequest;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.WordRaceLessonResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

public interface WordRaceLessonService {

    WordRaceLessonResponse createLesson(Long learningActivityId,
                                        UpsertWordRaceLessonRequest request,
                                        UserPrincipal userPrincipal);

    WordRaceLessonResponse updateLesson(Long lessonId, UpsertWordRaceLessonRequest request);

    void deleteLesson(Long lessonId);

    PageResponse<WordRaceLessonResponse> getLessons(Pageable pageable);

    WordRaceLessonResponse getLessonDetail(Long lessonId);
}
