package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.LearningLesson;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.entity.UserLessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, Long> {
    UserLessonProgress findByUserIdAndLearningLessonId(Long userId, Long lessonId);

    Optional<UserLessonProgress> findByUserAndLearningLesson(User user, LearningLesson lesson);

    List<UserLessonProgress> findByUserIdAndLearningLessonIdIn(Long userId, List<Long> lessonIds);
}