package com.memoflow.memoflow.service;

import com.memoflow.memoflow.entity.QuizOption;

import java.util.List;
import java.util.Optional;

public interface QuizOptionService {

    List<QuizOption> findAll();

    Optional<QuizOption> findById(Long id);

    List<QuizOption> findByQuizQuestionId(Long quizQuestionId);

    List<QuizOption> findCorrectByQuizQuestionId(Long quizQuestionId);

    QuizOption save(QuizOption quizOption);

    QuizOption update(Long id, QuizOption quizOption);

    void deleteById(Long id);
}
