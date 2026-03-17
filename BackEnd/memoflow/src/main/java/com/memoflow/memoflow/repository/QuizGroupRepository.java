package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.QuizGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizGroupRepository extends JpaRepository<QuizGroup, Long> {

    @Query("SELECT q FROM QuizGroup q WHERE q.learningLesson.id = :flashcardLessonId")
    List<QuizGroup> findByFlashcardLessonId(@Param("flashcardLessonId") Long flashcardLessonId);

    @Query("SELECT q FROM QuizGroup q WHERE q.learningLesson.id = :flashcardLessonId ORDER BY q.orderIndex ASC")
    List<QuizGroup> findByFlashcardLessonIdOrderByOrderIndexAsc(@Param("flashcardLessonId") Long flashcardLessonId);

    List<QuizGroup> findByType(String type);
}
