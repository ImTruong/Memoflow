package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.request.CreateStoryLearningLessonRequest;
import com.memoflow.memoflow.dto.request.UpdateStoryLearningLessonRequest;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.StoryLessonProgressResponse;
import com.memoflow.memoflow.dto.response.StoryLessonResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface StoryLessonService {

    StoryLessonResponse createLesson(Long learningActivityId,
                                     CreateStoryLearningLessonRequest request,
                                     MultipartFile image,
                                     UserPrincipal userPrincipal);

    StoryLessonResponse updateLesson(Long lessonId,
                                     UpdateStoryLearningLessonRequest request,
                                     MultipartFile image,
                                     UserPrincipal userPrincipal);

    void deleteLesson(Long lessonId, UserPrincipal userPrincipal);

    PageResponse<StoryLessonProgressResponse> getLessons(UserPrincipal userPrincipal, Pageable pageable);

    StoryLessonProgressResponse getLessonDetail(Long lessonId, UserPrincipal userPrincipal);

    void completeLesson(Long lessonId, UserPrincipal userPrincipal);
}
