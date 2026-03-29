package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {

    boolean existsByValueAndExpiresAtAfter(String code, LocalDateTime now);
}