package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.LearningLesson;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.entity.UserLessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT COUNT(ulp) FROM UserLessonProgress ulp " +
            "WHERE ulp.user.id = :userId " +
            "AND ulp.isCompleted = true " +
            "AND ulp.completedAt >= :startOfDay " +
            "AND ulp.learningLesson.type LIKE :typePattern")
    long countCompletedLessonsByTypeToday(@Param("userId") Long userId, 
                                        @Param("startOfDay") LocalDateTime startOfDay, 
                                        @Param("typePattern") String typePattern);

    @Query("SELECT COUNT(ulp) FROM UserLessonProgress ulp " +
            "WHERE ulp.user.id = :userId " +
            "AND ulp.isCompleted = true " +
            "AND ulp.completedAt BETWEEN :start AND :end " +
            "AND ulp.learningLesson.type LIKE :typePattern")
    long countCompletedLessonsByTypeInPeriod(@Param("userId") Long userId, 
                                          @Param("start") LocalDateTime start, 
                                          @Param("end") LocalDateTime end, 
                                          @Param("typePattern") String typePattern);

    @Query("SELECT ulp FROM UserLessonProgress ulp " +
            "WHERE ulp.user.id = :userId " +
            "AND ulp.isCompleted = true " +
            "AND ulp.learningLesson.type = :type " +
            "ORDER BY ulp.completedAt DESC")
    List<UserLessonProgress> findCompletedLessonsByUserIdAndType(@Param("userId") Long userId, 
                                                               @Param("type") String type);

    @Query(value = "SELECT DISTINCT CAST(updated_at AS DATE) FROM user_lesson_progress WHERE user_id = :userId AND updated_at IS NOT NULL ORDER BY CAST(updated_at AS DATE) DESC", nativeQuery = true)
    List<Object> findActivityDatesByUserId(@Param("userId") Long userId);
}