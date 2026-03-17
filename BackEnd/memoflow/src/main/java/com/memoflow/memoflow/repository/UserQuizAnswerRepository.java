package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.UserQuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserQuizAnswerRepository extends JpaRepository<UserQuizAnswer, Long> {

    List<UserQuizAnswer> findByUserId(Long userId);

    List<UserQuizAnswer> findByQuizQuestionId(Long quizQuestionId);

    Optional<UserQuizAnswer> findByUserIdAndQuizQuestionId(Long userId, Long quizQuestionId);
}
