package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.LearningMode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LearningModeRepository extends JpaRepository<LearningMode, Long> {

    Optional<LearningMode> findByName(String name);

    boolean existsByName(String name);
}
