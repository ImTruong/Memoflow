package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.FlashcardReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface FlashcardReviewRepository extends JpaRepository<FlashcardReview, Long> {

    List<FlashcardReview> findByUserId(Long userId);

    List<FlashcardReview> findByWordId(Long wordId);

    Optional<FlashcardReview> findByUserIdAndWordId(Long userId, Long wordId);

    List<FlashcardReview> findByUserIdAndDifficulty(Long userId, String difficulty);

    Optional<FlashcardReview> findFirstByUserIdAndWordIdOrderByCreatedAtDesc(Long userId, Long wordId);

    @Query(value = "SELECT COUNT(DISTINCT w.id) FROM words w " +
           "JOIN flashcard_reviews fr ON fr.word_id = w.id " +
           "WHERE w.learning_lesson_id = :flashcardLessonId " +
           "AND fr.user_id = :userId " +
           "AND fr.next_review_date >= :now " +
           "AND fr.id = (SELECT MAX(fr2.id) FROM flashcard_reviews fr2 WHERE fr2.word_id = w.id AND fr2.user_id = :userId)", nativeQuery = true)
    long countLearnedWordsByFlashcardLesson(@Param("flashcardLessonId") Long flashcardLessonId, @Param("userId") Long userId, @Param("now") LocalDateTime now);

    @Query(value = "SELECT COUNT(DISTINCT w.id) FROM words w " +
           "JOIN flashcard_reviews fr ON fr.word_id = w.id " +
           "WHERE w.learning_lesson_id = :flashcardLessonId " +
           "AND fr.user_id = :userId", nativeQuery = true)
    long countWordsLearnedAtLeastOnceByFlashcardLesson(@Param("flashcardLessonId") Long flashcardLessonId, @Param("userId") Long userId);

    @Query(value = "SELECT COUNT(DISTINCT word_id) FROM flashcard_reviews " +
           "WHERE user_id = :userId AND created_at >= :startOfDay", nativeQuery = true)
    long countDistinctWordsReviewedToday(@Param("userId") Long userId, @Param("startOfDay") LocalDateTime startOfDay);

    @Query(value = "SELECT COUNT(DISTINCT w.id) FROM words w " +
           "JOIN flashcard_reviews fr ON fr.word_id = w.id " +
           "WHERE fr.user_id = :userId " +
           "AND fr.next_review_date <= :endOfDay " +
           "AND fr.id = (SELECT MAX(fr2.id) FROM flashcard_reviews fr2 WHERE fr2.word_id = w.id AND fr2.user_id = :userId)", nativeQuery = true)
    long countTotalDueWordsByUserId(@Param("userId") Long userId, @Param("endOfDay") LocalDateTime endOfDay);

    long countByUserId(Long userId);

    @Query("SELECT fr FROM FlashcardReview fr WHERE fr.user.id = :userId AND fr.createdAt BETWEEN :start AND :end ORDER BY fr.createdAt DESC")
    Page<FlashcardReview> findByUserIdAndCreatedAtBetween(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Pageable pageable);

    @Query(value = "SELECT CAST(created_at AS DATE) as date, COUNT(*) as count FROM flashcard_reviews WHERE user_id = :userId AND created_at BETWEEN :start AND :end GROUP BY CAST(created_at AS DATE)", nativeQuery = true)
    List<Object[]> countReviewsByDay(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT fr FROM FlashcardReview fr WHERE fr.user.id = :userId AND LOWER(fr.word.name) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY fr.createdAt DESC")
    Page<FlashcardReview> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword, Pageable pageable);

    @Query(value = "SELECT DISTINCT CAST(created_at AS DATE) FROM flashcard_reviews WHERE user_id = :userId ORDER BY CAST(created_at AS DATE) DESC", nativeQuery = true)
    List<Object> findReviewDatesByUserId(@Param("userId") Long userId);
}