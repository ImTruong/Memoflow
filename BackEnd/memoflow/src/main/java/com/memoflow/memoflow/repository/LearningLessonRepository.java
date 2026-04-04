package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.dto.response.BilingualResponse;
import com.memoflow.memoflow.dto.response.ListeningLessonResponse;
import com.memoflow.memoflow.entity.LearningLesson;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningLessonRepository extends JpaRepository<LearningLesson, Long> {

        @Query("SELECT l FROM LearningLesson l WHERE l.learningActivity.id = :learningActivityId AND l.deleted = false")
        List<LearningLesson> findByLearningActivityId(@Param("learningActivityId") Long learningActivityId);

        @Query("SELECT l FROM LearningLesson l WHERE l.type = :type AND l.deleted = false")
        List<LearningLesson> findByType(@Param("type") String type);

        Page<LearningLesson> findByType(String type, Pageable pageable);

        List<LearningLesson> findByTypeOrderByIdAsc(String type);

        List<LearningLesson> findByTypeAndLearningActivityIdOrderByIdAsc(String type, Long learningActivityId);

        @Query("SELECT l FROM LearningLesson l WHERE l.creator.id = :userId AND l.deleted = false")
        Page<LearningLesson> findByCreatorId(@Param("userId") Long userId, Pageable pageable);

        @Query(value = "SELECT * FROM learning_lessons l WHERE l.is_deleted = false AND JSON_EXTRACT(l.content, '$.privacyMode') = 'PUBLIC'", nativeQuery = true)
        Page<LearningLesson> findCommunityFlashcardLessons(Pageable pageable);

        @Query("SELECT new com.memoflow.memoflow.dto.response.ListeningLessonResponse(" +
                "ll.id, ll.title, " +
                "CASE WHEN ulp IS NULL THEN NULL ELSE ulp.isCompleted END, " +
                "COUNT(qq.id), " +
                "CASE WHEN ulp IS NULL THEN NULL ELSE ulp.score END) " +
                "FROM LearningLesson ll " +
                "LEFT JOIN UserLessonProgress ulp ON ll.id = ulp.learningLesson.id AND ulp.user.id = :userId " +
                "LEFT JOIN ll.quizGroups g " +
                "LEFT JOIN g.quizQuestions qq " +
                "WHERE ll.type = :type " +
                "AND ll.deleted = false " +
                "AND ( :status IS NULL " +
                "   OR :status = 'completed' AND ulp.isCompleted = true " +
                "   OR :status = 'in-progress' AND ulp.isCompleted = false " +
                "   OR :status = 'not-started' AND ulp IS NULL " +
                "   OR (:status NOT IN ('completed','in-progress','not-started')) ) " +
                "GROUP BY ll.id, ll.title, ulp.isCompleted, ulp.score")
        Page<ListeningLessonResponse> findListeningLessons(@Param("userId") Long userId,
                                                           @Param("type") String type,
                                                           @Param("status") String status,
                                                           Pageable pageable);

        @Query("SELECT l FROM LearningLesson l " +
                "LEFT JOIN FETCH l.image m " +
                "WHERE l.type = 'BILINGUAL' " +
                "AND l.deleted = false " +
                "AND (:keyword IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                "OR LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                "ORDER BY FUNCTION('STR_TO_DATE', FUNCTION('JSON_UNQUOTE', FUNCTION('JSON_EXTRACT', l.content, '$.createdAt')), '%Y-%m-%d %H:%i:%s.%f') DESC")
        Page<LearningLesson> findBilingualNewest(@Param("keyword") String keyword, Pageable pageable);

        @Query("SELECT l FROM LearningLesson l " +
                "LEFT JOIN FETCH l.image m " +
                "WHERE l.type = 'BILINGUAL' " +
                "AND l.deleted = false " +
                "AND (:keyword IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                "OR LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                "ORDER BY FUNCTION('STR_TO_DATE', FUNCTION('JSON_UNQUOTE', FUNCTION('JSON_EXTRACT', l.content, '$.createdAt')), '%Y-%m-%d %H:%i:%s.%f') ASC")
        Page<LearningLesson> findBilingualOldest(@Param("keyword") String keyword, Pageable pageable);

        @Query("SELECT l FROM LearningLesson l " +
                "LEFT JOIN FETCH l.image m " +
                "WHERE l.type = 'BILINGUAL' " +
                "AND l.deleted = false " +
                "AND (:keyword IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                "OR LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                "ORDER BY FUNCTION('JSON_UNQUOTE', FUNCTION('JSON_EXTRACT', l.content, '$.views')) DESC")
        Page<LearningLesson> findBilingualPopular(@Param("keyword") String keyword, Pageable pageable);

        @Query("SELECT l FROM LearningLesson l " +
                "LEFT JOIN FETCH l.image m " +
                "JOIN UserLessonProgress p ON p.learningLesson = l AND p.user.id = :userId AND p.isCompleted = true " +
                "WHERE l.type = 'BILINGUAL' " +
                "AND l.deleted = false " +
                "AND (:keyword IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                "OR LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                "ORDER BY FUNCTION('STR_TO_DATE', FUNCTION('JSON_UNQUOTE', FUNCTION('JSON_EXTRACT', l.content, '$.createdAt')), '%Y-%m-%d %H:%i:%s.%f') DESC")
        Page<LearningLesson> findBilingualReadNewest(@Param("keyword") String keyword, @Param("userId") Long userId, Pageable pageable);

        @Query("SELECT l FROM LearningLesson l " +
                "LEFT JOIN FETCH l.image m " +
                "JOIN UserLessonProgress p ON p.learningLesson = l AND p.user.id = :userId AND p.isCompleted = true " +
                "WHERE l.type = 'BILINGUAL' " +
                "AND l.deleted = false " +
                "AND (:keyword IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                "OR LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                "ORDER BY FUNCTION('STR_TO_DATE', FUNCTION('JSON_UNQUOTE', FUNCTION('JSON_EXTRACT', l.content, '$.createdAt')), '%Y-%m-%d %H:%i:%s.%f') ASC")
        Page<LearningLesson> findBilingualReadOldest(@Param("keyword") String keyword, @Param("userId") Long userId, Pageable pageable);

        @Query("SELECT l FROM LearningLesson l " +
                "LEFT JOIN FETCH l.image m " +
                "JOIN UserLessonProgress p ON p.learningLesson = l AND p.user.id = :userId AND p.isCompleted = true " +
                "WHERE l.type = 'BILINGUAL' " +
                "AND l.deleted = false " +
                "AND (:keyword IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                "OR LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                "ORDER BY FUNCTION('JSON_UNQUOTE', FUNCTION('JSON_EXTRACT', l.content, '$.views')) DESC")
        Page<LearningLesson> findBilingualReadPopular(@Param("keyword") String keyword, @Param("userId") Long userId, Pageable pageable);

        @Query("SELECT l FROM LearningLesson l " +
                "LEFT JOIN FETCH l.image m " +
                "WHERE l.type = 'BILINGUAL' " +
                "AND l.deleted = false " +
                "AND (:keyword IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                "OR LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                "AND l.id NOT IN (" +
                "  SELECT p.learningLesson.id FROM UserLessonProgress p " +
                "  WHERE p.user.id = :userId AND p.isCompleted = true" +
                ") " +
                "ORDER BY FUNCTION('STR_TO_DATE', FUNCTION('JSON_UNQUOTE', FUNCTION('JSON_EXTRACT', l.content, '$.createdAt')), '%Y-%m-%d %H:%i:%s.%f') DESC")
        Page<LearningLesson> findBilingualUnreadNewest(@Param("keyword") String keyword, @Param("userId") Long userId, Pageable pageable);

        @Query("SELECT l FROM LearningLesson l " +
                "LEFT JOIN FETCH l.image m " +
                "WHERE l.type = 'BILINGUAL' " +
                "AND l.deleted = false " +
                "AND (:keyword IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                "OR LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                "AND l.id NOT IN (" +
                "  SELECT p.learningLesson.id FROM UserLessonProgress p " +
                "  WHERE p.user.id = :userId AND p.isCompleted = true" +
                ") " +
                "ORDER BY FUNCTION('STR_TO_DATE', FUNCTION('JSON_UNQUOTE', FUNCTION('JSON_EXTRACT', l.content, '$.createdAt')), '%Y-%m-%d %H:%i:%s.%f') ASC")
        Page<LearningLesson> findBilingualUnreadOldest(@Param("keyword") String keyword, @Param("userId") Long userId, Pageable pageable);

        @Query("SELECT l FROM LearningLesson l " +
                "LEFT JOIN FETCH l.image m " +
                "WHERE l.type = 'BILINGUAL' " +
                "AND l.deleted = false " +
                "AND (:keyword IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                "OR LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                "AND l.id NOT IN (" +
                "  SELECT p.learningLesson.id FROM UserLessonProgress p " +
                "  WHERE p.user.id = :userId AND p.isCompleted = true" +
                ") " +
                "ORDER BY FUNCTION('JSON_UNQUOTE', FUNCTION('JSON_EXTRACT', l.content, '$.views')) DESC")
        Page<LearningLesson> findBilingualUnreadPopular(@Param("keyword") String keyword, @Param("userId") Long userId, Pageable pageable);

        @Modifying
        @Query(value = "UPDATE learning_lessons " +
                "SET content = JSON_SET(content, '$.views', CAST(JSON_EXTRACT(content, '$.views') AS UNSIGNED) + 1) " +
                "WHERE id = :id", nativeQuery = true)
        void incrementViews(@Param("id") Long id);

        @Query("SELECT p.learningLesson.id FROM UserLessonProgress p " +
                "WHERE p.user.id = :userId AND p.isCompleted = true " +
                "AND p.learningLesson.id IN :lessonIds")
        List<Long> findReadLessonIds(
                @Param("userId") Long userId,
                @Param("lessonIds") List<Long> lessonIds
        );
}
