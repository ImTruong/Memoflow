package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.LearningActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningActivityRepository extends JpaRepository<LearningActivity, Long> {

    List<LearningActivity> findByLearningModeId(Long learningModeId);

    List<LearningActivity> findByType(Integer type);
}
