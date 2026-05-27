package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.request.CreateStoryLearningLessonRequest;
import com.memoflow.memoflow.dto.request.UpdateStoryLearningLessonRequest;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.dto.response.StoryLessonProgressResponse;
import com.memoflow.memoflow.dto.response.StoryLessonResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

// Interface dinh nghia nghiep vu truyen chem cho controller goi.
public interface StoryLessonService {

    // Tao truyen chem moi kem anh minh hoa neu admin co upload.
    StoryLessonResponse createLesson(Long learningActivityId,
                                     CreateStoryLearningLessonRequest request,
                                     MultipartFile image,
                                     UserPrincipal userPrincipal);

    // Cap nhat thong tin, noi dung va anh minh hoa cua truyen chem.
    StoryLessonResponse updateLesson(Long lessonId,
                                     UpdateStoryLearningLessonRequest request,
                                     MultipartFile image,
                                     UserPrincipal userPrincipal);

    // Xoa truyen chem theo id.
    void deleteLesson(Long lessonId, UserPrincipal userPrincipal);

    // Lay danh sach truyen chem kem tien do doc cua user.
    PageResponse<StoryLessonProgressResponse> getLessons(UserPrincipal userPrincipal, Pageable pageable);

    // Lay chi tiet mot truyen chem kem tien do doc cua user.
    StoryLessonProgressResponse getLessonDetail(Long lessonId, UserPrincipal userPrincipal);

    // Danh dau user da hoan thanh truyen chem.
    void completeLesson(Long lessonId, UserPrincipal userPrincipal);
}
