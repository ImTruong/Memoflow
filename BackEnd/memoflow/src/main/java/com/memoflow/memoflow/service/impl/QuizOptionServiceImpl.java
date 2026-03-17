package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.entity.QuizOption;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.QuizOptionRepository;
import com.memoflow.memoflow.service.QuizOptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizOptionServiceImpl implements QuizOptionService {

    private final QuizOptionRepository quizOptionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<QuizOption> findAll() {
        return quizOptionRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<QuizOption> findById(Long id) {
        return quizOptionRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizOption> findByQuizQuestionId(Long quizQuestionId) {
        return quizOptionRepository.findByQuizQuestionIdOrderByOrderIndexAsc(quizQuestionId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizOption> findCorrectByQuizQuestionId(Long quizQuestionId) {
        return quizOptionRepository.findByQuizQuestionIdAndIsCorrect(quizQuestionId, true);
    }

    @Override
    public QuizOption save(QuizOption quizOption) {
        return quizOptionRepository.save(quizOption);
    }

    @Override
    public QuizOption update(Long id, QuizOption quizOption) {
        quizOptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuizOption", "id", id));
        quizOption.setId(id);
        return quizOptionRepository.save(quizOption);
    }

    @Override
    public void deleteById(Long id) {
        quizOptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuizOption", "id", id));
        quizOptionRepository.deleteById(id);
    }
}
