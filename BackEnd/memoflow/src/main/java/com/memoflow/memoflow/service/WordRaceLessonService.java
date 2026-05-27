package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.request.UpsertWordRaceLessonRequest;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.WordRaceLessonResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

// Interface dinh nghia nghiep vu man choi Word Race.
public interface WordRaceLessonService {

    // Tao man Word Race moi trong mot learning activity.
    WordRaceLessonResponse createLesson(Long learningActivityId,
                                        UpsertWordRaceLessonRequest request,
                                        UserPrincipal userPrincipal);

    // Cap nhat cau hinh man Word Race.
    WordRaceLessonResponse updateLesson(Long lessonId, UpsertWordRaceLessonRequest request);

    // Xoa man Word Race theo id.
    void deleteLesson(Long lessonId);

    // Lay danh sach man Word Race co phan trang.
    PageResponse<WordRaceLessonResponse> getLessons(Pageable pageable);

    // Lay chi tiet cau hinh mot man Word Race.
    WordRaceLessonResponse getLessonDetail(Long lessonId);
}
