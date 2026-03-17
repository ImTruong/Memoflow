package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.QuizOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizOptionRepository extends JpaRepository<QuizOption, Long> {

    List<QuizOption> findByQuizQuestionId(Long quizQuestionId);

    List<QuizOption> findByQuizQuestionIdOrderByOrderIndexAsc(Long quizQuestionId);

    List<QuizOption> findByQuizQuestionIdAndIsCorrect(Long quizQuestionId, Boolean isCorrect);
}
