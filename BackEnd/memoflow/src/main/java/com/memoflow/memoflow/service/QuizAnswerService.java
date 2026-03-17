package com.memoflow.memoflow.service;

import com.memoflow.memoflow.entity.QuizAnswer;

import java.util.List;
import java.util.Optional;

public interface QuizAnswerService {

    List<QuizAnswer> findAll();

    Optional<QuizAnswer> findById(Long id);

    List<QuizAnswer> findByQuizQuestionId(Long quizQuestionId);

    QuizAnswer save(QuizAnswer quizAnswer);

    QuizAnswer update(Long id, QuizAnswer quizAnswer);

    void deleteById(Long id);
}
