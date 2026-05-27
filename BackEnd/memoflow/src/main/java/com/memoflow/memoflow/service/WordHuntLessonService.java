package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.request.UpdateWordHuntProgressRequest;
import com.memoflow.memoflow.dto.request.UpsertWordHuntLessonRequest;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.WordHuntLessonResponse;
import com.memoflow.memoflow.dto.response.WordHuntProgressResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

// Interface dinh nghia nghiep vu man choi Word Hunt va tien do user.
public interface WordHuntLessonService {

    // Tao man Word Hunt moi trong mot learning activity.
    WordHuntLessonResponse createLesson(Long learningActivityId, UpsertWordHuntLessonRequest request, UserPrincipal userPrincipal);

    // Cap nhat cau hinh man Word Hunt.
    WordHuntLessonResponse updateLesson(Long lessonId, UpsertWordHuntLessonRequest request);

    // Xoa man Word Hunt theo id.
    void deleteLesson(Long lessonId);

    // Lay danh sach Word Hunt kem tien do cua user.
    PageResponse<WordHuntProgressResponse> getLessons(UserPrincipal userPrincipal, Pageable pageable);

    // Lay chi tiet Word Hunt kem tien do cua user.
    WordHuntProgressResponse getLessonDetail(Long lessonId, UserPrincipal userPrincipal);

    // Cap nhat tien do sau khi user choi Word Hunt.
    WordHuntProgressResponse updateProgress(Long lessonId, UpdateWordHuntProgressRequest request, UserPrincipal userPrincipal);
}
