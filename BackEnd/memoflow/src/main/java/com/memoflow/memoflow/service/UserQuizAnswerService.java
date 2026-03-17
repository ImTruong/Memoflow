package com.memoflow.memoflow.service;

import com.memoflow.memoflow.entity.UserQuizAnswer;

import java.util.List;
import java.util.Optional;

public interface UserQuizAnswerService {

    List<UserQuizAnswer> findAll();

    Optional<UserQuizAnswer> findById(Long id);

    List<UserQuizAnswer> findByUserId(Long userId);

    List<UserQuizAnswer> findByQuizQuestionId(Long quizQuestionId);

    Optional<UserQuizAnswer> findByUserIdAndQuizQuestionId(Long userId, Long quizQuestionId);

    UserQuizAnswer save(UserQuizAnswer userQuizAnswer);

    UserQuizAnswer update(Long id, UserQuizAnswer userQuizAnswer);

    void deleteById(Long id);
}
