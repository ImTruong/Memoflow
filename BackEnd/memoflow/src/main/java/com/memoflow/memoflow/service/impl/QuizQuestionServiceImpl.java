package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.entity.QuizQuestion;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.QuizQuestionRepository;
import com.memoflow.memoflow.service.QuizQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizQuestionServiceImpl implements QuizQuestionService {

    private final QuizQuestionRepository quizQuestionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<QuizQuestion> findAll() {
        return quizQuestionRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<QuizQuestion> findById(Long id) {
        return quizQuestionRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizQuestion> findByQuizGroupId(Long quizGroupId) {
        return quizQuestionRepository.findByQuizGroupIdOrderByOrderIndexAsc(quizGroupId);
    }

    @Override
    public QuizQuestion save(QuizQuestion quizQuestion) {
        return quizQuestionRepository.save(quizQuestion);
    }

    @Override
    public QuizQuestion update(Long id, QuizQuestion quizQuestion) {
        quizQuestionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuizQuestion", "id", id));
        quizQuestion.setId(id);
        return quizQuestionRepository.save(quizQuestion);
    }

    @Override
    public void deleteById(Long id) {
        quizQuestionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuizQuestion", "id", id));
        quizQuestionRepository.deleteById(id);
    }
}
