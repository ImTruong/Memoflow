package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.entity.UserQuizAnswer;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.UserQuizAnswerRepository;
import com.memoflow.memoflow.service.UserQuizAnswerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserQuizAnswerServiceImpl implements UserQuizAnswerService {

    private final UserQuizAnswerRepository userQuizAnswerRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserQuizAnswer> findAll() {
        return userQuizAnswerRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserQuizAnswer> findById(Long id) {
        return userQuizAnswerRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserQuizAnswer> findByUserId(Long userId) {
        return userQuizAnswerRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserQuizAnswer> findByQuizQuestionId(Long quizQuestionId) {
        return userQuizAnswerRepository.findByQuizQuestionId(quizQuestionId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserQuizAnswer> findByUserIdAndQuizQuestionId(Long userId, Long quizQuestionId) {
        return userQuizAnswerRepository.findByUserIdAndQuizQuestionId(userId, quizQuestionId);
    }

    @Override
    public UserQuizAnswer save(UserQuizAnswer userQuizAnswer) {
        return userQuizAnswerRepository.save(userQuizAnswer);
    }

    @Override
    public UserQuizAnswer update(Long id, UserQuizAnswer userQuizAnswer) {
        userQuizAnswerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UserQuizAnswer", "id", id));
        userQuizAnswer.setId(id);
        return userQuizAnswerRepository.save(userQuizAnswer);
    }

    @Override
    public void deleteById(Long id) {
        userQuizAnswerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UserQuizAnswer", "id", id));
        userQuizAnswerRepository.deleteById(id);
    }
}
