package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {

    List<QuizQuestion> findByQuizGroupId(Long quizGroupId);

    List<QuizQuestion> findByQuizGroupIdOrderByOrderIndexAsc(Long quizGroupId);

    List<QuizQuestion> findByType(String type);
}
