package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.LearningLesson;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.entity.UserLessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, Long> {
    UserLessonProgress findByUserIdAndLearningLessonId(Long userId, Long lessonId);

    Optional<UserLessonProgress> findByUserAndLearningLesson(User user, LearningLesson lesson);

    List<UserLessonProgress> findByUserIdAndLearningLessonIdIn(Long userId, List<Long> lessonIds);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByLearningLessonId(Long lessonId);

    boolean existsByUserIdAndUpdatedAtAfter(Long userId, LocalDateTime after);

    boolean existsByUserIdAndCreatedAtAfter(Long userId, LocalDateTime after);

    boolean existsByUserIdAndLearningLessonIdAndIsCompletedTrue(Long userId, Long lessonId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(ulp) FROM UserLessonProgress ulp " +
                                                "WHERE ulp.user.id = :userId " +
                                                "AND ulp.isCompleted = true " +
                                                "AND ulp.completedAt >= :startOfDay " +
                                                "AND ulp.learningLesson.type LIKE :typePattern")
    long countCompletedLessonsByTypeToday(@org.springframework.data.repository.query.Param("userId") Long userId, 
                                        @org.springframework.data.repository.query.Param("startOfDay") java.time.LocalDateTime startOfDay, 
                                        @org.springframework.data.repository.query.Param("typePattern") String typePattern);

    @org.springframework.data.jpa.repository.Query("SELECT ulp FROM UserLessonProgress ulp " +
                                                "WHERE ulp.user.id = :userId " +
                                                "AND ulp.isCompleted = true " +
                                                "AND ulp.learningLesson.type = :type " +
                                                "ORDER BY ulp.completedAt DESC")
    List<UserLessonProgress> findCompletedLessonsByUserIdAndType(@org.springframework.data.repository.query.Param("userId") Long userId, 
                                                               @org.springframework.data.repository.query.Param("type") String type);
}