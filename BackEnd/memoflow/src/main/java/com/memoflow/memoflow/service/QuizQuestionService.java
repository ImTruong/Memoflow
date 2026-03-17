package com.memoflow.memoflow.service;

import com.memoflow.memoflow.entity.QuizQuestion;

import java.util.List;
import java.util.Optional;

public interface QuizQuestionService {

    List<QuizQuestion> findAll();

    Optional<QuizQuestion> findById(Long id);

    List<QuizQuestion> findByQuizGroupId(Long quizGroupId);

    QuizQuestion save(QuizQuestion quizQuestion);

    QuizQuestion update(Long id, QuizQuestion quizQuestion);

    void deleteById(Long id);
}
