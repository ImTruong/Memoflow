package com.memoflow.memoflow.service;

import com.memoflow.memoflow.entity.LearningActivity;

import java.util.List;
import java.util.Optional;

public interface LearningActivityService {

    List<LearningActivity> findAll();

    Optional<LearningActivity> findById(Long id);

    List<LearningActivity> findByLearningModeId(Long learningModeId);

    LearningActivity save(LearningActivity learningActivity);

    LearningActivity update(Long id, LearningActivity learningActivity);

    void deleteById(Long id);
}
