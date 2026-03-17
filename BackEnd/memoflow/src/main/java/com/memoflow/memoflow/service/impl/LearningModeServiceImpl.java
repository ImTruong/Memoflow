package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.entity.LearningMode;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.LearningModeRepository;
import com.memoflow.memoflow.service.LearningModeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class LearningModeServiceImpl implements LearningModeService {

    private final LearningModeRepository learningModeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<LearningMode> findAll() {
        return learningModeRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<LearningMode> findById(Long id) {
        return learningModeRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<LearningMode> findByName(String name) {
        return learningModeRepository.findByName(name);
    }

    @Override
    public LearningMode save(LearningMode learningMode) {
        return learningModeRepository.save(learningMode);
    }

    @Override
    public LearningMode update(Long id, LearningMode learningMode) {
        learningModeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LearningMode", "id", id));
        learningMode.setId(id);
        return learningModeRepository.save(learningMode);
    }

    @Override
    public void deleteById(Long id) {
        learningModeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LearningMode", "id", id));
        learningModeRepository.deleteById(id);
    }
}
