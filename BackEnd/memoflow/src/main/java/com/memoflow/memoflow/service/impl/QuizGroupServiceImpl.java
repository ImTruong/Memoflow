package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.entity.QuizGroup;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.QuizGroupRepository;
import com.memoflow.memoflow.service.QuizGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizGroupServiceImpl implements QuizGroupService {

    private final QuizGroupRepository quizGroupRepository;

    @Override
    @Transactional(readOnly = true)
    public List<QuizGroup> findAll() {
        return quizGroupRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<QuizGroup> findById(Long id) {
        return quizGroupRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizGroup> findByFlashcardLessonId(Long flashcardLessonId) {
        return quizGroupRepository.findByFlashcardLessonIdOrderByOrderIndexAsc(flashcardLessonId);
    }

    @Override
    public QuizGroup save(QuizGroup quizGroup) {
        return quizGroupRepository.save(quizGroup);
    }

    @Override
    public QuizGroup update(Long id, QuizGroup quizGroup) {
        quizGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuizGroup", "id", id));
        quizGroup.setId(id);
        return quizGroupRepository.save(quizGroup);
    }

    @Override
    public void deleteById(Long id) {
        quizGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuizGroup", "id", id));
        quizGroupRepository.deleteById(id);
    }
}
