package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.UserQuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserQuizAnswerRepository extends JpaRepository<UserQuizAnswer, Long> {

    List<UserQuizAnswer> findByUserId(Long userId);

    List<UserQuizAnswer> findByQuizQuestionId(Long quizQuestionId);

    Optional<UserQuizAnswer> findByUserIdAndQuizQuestionId(Long userId, Long quizQuestionId);

    @Query("SELECT a FROM UserQuizAnswer a " +
            "WHERE a.user.id = :userId " +
            "AND a.quizQuestion.quizGroup.learningLesson.id = :lessonId")
    List<UserQuizAnswer> findByUserIdAndLessonId(Long userId, Long lessonId);

    void deleteByQuizQuestionId(Long questionId);

    void deleteByQuizOptionId(Long quizOptionId);
}
