package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.Word;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WordRepository extends JpaRepository<Word, Long> {

       @Query("SELECT w FROM Word w WHERE w.learningLesson.id = :flashcardLessonId AND w.deleted = false")
       List<Word> findByFlashcardLessonId(@Param("flashcardLessonId") Long flashcardLessonId);

       @Query("SELECT w FROM Word w WHERE w.learningLesson.id = :flashcardLessonId AND w.deleted = false")
       Page<Word> findByFlashcardLessonId(@Param("flashcardLessonId") Long flashcardLessonId, Pageable pageable);

       @Query("SELECT w FROM Word w WHERE w.learningLesson.id IN :flashcardLessonIds AND w.deleted = false")
       List<Word> findByFlashcardLessonIdIn(@Param("flashcardLessonIds") List<Long> flashcardLessonIds);

       @Query("SELECT w FROM Word w WHERE w.learningLesson.id = :flashcardLessonId AND w.deleted = false AND LOWER(w.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
       Page<Word> findByFlashcardLessonIdAndName(@Param("flashcardLessonId") Long flashcardLessonId,
                     @Param("keyword") String keyword, Pageable pageable);

       @Query("SELECT w FROM Word w WHERE w.deleted = false AND LOWER(w.name) LIKE LOWER(CONCAT('%', :name, '%'))")
       List<Word> findByNameContainingIgnoreCase(@Param("name") String name);

       @Query("SELECT COUNT(w) FROM Word w WHERE w.learningLesson.id = :flashcardLessonId AND w.deleted = false")
       long countByFlashcardLessonId(@Param("flashcardLessonId") Long flashcardLessonId);

       @Query(value = "SELECT w.* FROM words w " +
                     "JOIN flashcard_reviews fr ON fr.word_id = w.id " +
                     "WHERE w.learning_lesson_id = :flashcardLessonId " +
                     "AND w.is_deleted = false " +
                     "AND fr.user_id = :userId " +
                     "AND fr.next_review_date < :now " +
                     "AND fr.id = (SELECT MAX(fr2.id) FROM flashcard_reviews fr2 WHERE fr2.word_id = w.id AND fr2.user_id = :userId)", countQuery = "SELECT COUNT(*) FROM words w "
                                   +
                                   "JOIN flashcard_reviews fr ON fr.word_id = w.id " +
                                   "WHERE w.learning_lesson_id = :flashcardLessonId " +
                                   "AND w.is_deleted = false " +
                                   "AND fr.user_id = :userId " +
                                   "AND fr.next_review_date < :now " +
                                   "AND fr.id = (SELECT MAX(fr2.id) FROM flashcard_reviews fr2 WHERE fr2.word_id = w.id AND fr2.user_id = :userId)", nativeQuery = true)
       Page<Word> findDueWordsByLessonAndUser(@Param("flashcardLessonId") Long flashcardLessonId,
                     @Param("userId") Long userId, @Param("now") LocalDateTime now, Pageable pageable);

       @Query(value = "SELECT w.* FROM words w " +
                     "JOIN flashcard_reviews fr ON fr.word_id = w.id " +
                     "WHERE w.is_deleted = false " +
                     "AND fr.user_id = :userId " +
                     "AND fr.next_review_date < :now " +
                     "AND fr.id = (SELECT MAX(fr2.id) FROM flashcard_reviews fr2 WHERE fr2.word_id = w.id AND fr2.user_id = :userId)", countQuery = "SELECT COUNT(*) FROM words w "
                                   +
                                   "JOIN flashcard_reviews fr ON fr.word_id = w.id " +
                                   "WHERE w.is_deleted = false " +
                                   "AND fr.user_id = :userId " +
                                   "AND fr.next_review_date < :now " +
                                   "AND fr.id = (SELECT MAX(fr2.id) FROM flashcard_reviews fr2 WHERE fr2.word_id = w.id AND fr2.user_id = :userId)", nativeQuery = true)
       Page<Word> findDueWordsByUser(@Param("userId") Long userId, @Param("now") LocalDateTime now, Pageable pageable);
}
