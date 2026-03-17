package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.LearningLesson;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningLessonRepository extends JpaRepository<LearningLesson, Long> {

    List<LearningLesson> findByLearningActivityId(Long learningActivityId);

    List<LearningLesson> findByType(String type);

    Page<LearningLesson> findByCreatorId(Long userId, Pageable pageable);

    @Query(value = "SELECT * FROM learning_lessons l WHERE JSON_EXTRACT(l.content, '$.privacyMode') = 'PUBLIC'", nativeQuery = true)
    Page<LearningLesson> findCommunityFlashcardLessons(Pageable pageable);
}
