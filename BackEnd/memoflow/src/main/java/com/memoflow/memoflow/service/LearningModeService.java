package com.memoflow.memoflow.service;

import com.memoflow.memoflow.entity.LearningMode;

import java.util.List;
import java.util.Optional;

public interface LearningModeService {

    List<LearningMode> findAll();

    Optional<LearningMode> findById(Long id);

    Optional<LearningMode> findByName(String name);

    LearningMode save(LearningMode learningMode);

    LearningMode update(Long id, LearningMode learningMode);

    void deleteById(Long id);
}
