package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.entity.QuizAnswer;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.QuizAnswerRepository;
import com.memoflow.memoflow.service.QuizAnswerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizAnswerServiceImpl implements QuizAnswerService {

    private final QuizAnswerRepository quizAnswerRepository;

    @Override
    @Transactional(readOnly = true)
    public List<QuizAnswer> findAll() {
        return quizAnswerRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<QuizAnswer> findById(Long id) {
        return quizAnswerRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizAnswer> findByQuizQuestionId(Long quizQuestionId) {
        return quizAnswerRepository.findByQuizQuestionId(quizQuestionId);
    }

    @Override
    public QuizAnswer save(QuizAnswer quizAnswer) {
        return quizAnswerRepository.save(quizAnswer);
    }

    @Override
    public QuizAnswer update(Long id, QuizAnswer quizAnswer) {
        quizAnswerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuizAnswer", "id", id));
        quizAnswer.setId(id);
        return quizAnswerRepository.save(quizAnswer);
    }

    @Override
    public void deleteById(Long id) {
        quizAnswerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuizAnswer", "id", id));
        quizAnswerRepository.deleteById(id);
    }
}
