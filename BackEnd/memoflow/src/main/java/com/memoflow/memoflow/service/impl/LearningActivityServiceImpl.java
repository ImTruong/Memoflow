package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.entity.LearningActivity;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.LearningActivityRepository;
import com.memoflow.memoflow.service.LearningActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class LearningActivityServiceImpl implements LearningActivityService {

    private final LearningActivityRepository learningActivityRepository;

    @Override
    @Transactional(readOnly = true)
    public List<LearningActivity> findAll() {
        return learningActivityRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<LearningActivity> findById(Long id) {
        return learningActivityRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LearningActivity> findByLearningModeId(Long learningModeId) {
        return learningActivityRepository.findByLearningModeId(learningModeId);
    }

    @Override
    public LearningActivity save(LearningActivity learningActivity) {
        return learningActivityRepository.save(learningActivity);
    }

    @Override
    public LearningActivity update(Long id, LearningActivity learningActivity) {
        learningActivityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LearningActivity", "id", id));
        learningActivity.setId(id);
        return learningActivityRepository.save(learningActivity);
    }

    @Override
    public void deleteById(Long id) {
        learningActivityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LearningActivity", "id", id));
        learningActivityRepository.deleteById(id);
    }
}
