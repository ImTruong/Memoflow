package com.memoflow.memoflow.service;

import com.memoflow.memoflow.entity.QuizGroup;

import java.util.List;
import java.util.Optional;

public interface QuizGroupService {

    List<QuizGroup> findAll();

    Optional<QuizGroup> findById(Long id);

    List<QuizGroup> findByFlashcardLessonId(Long flashcardLessonId);

    QuizGroup save(QuizGroup quizGroup);

    QuizGroup update(Long id, QuizGroup quizGroup);

    void deleteById(Long id);
}
