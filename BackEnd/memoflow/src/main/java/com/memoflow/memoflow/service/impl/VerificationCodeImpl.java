package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.repository.VerificationCodeRepository;
import com.memoflow.memoflow.service.VerificationCodeService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class VerificationCodeImpl implements VerificationCodeService {

    private final VerificationCodeRepository verificationCodeRepository;

    public String generateCode() {
        final SecureRandom random = new SecureRandom();
        String code;
        do code = String.format("%06d", random.nextInt(100000));
        while (verificationCodeRepository.existsByValueAndExpiresAtAfter(code, LocalDateTime.now()));
        return code;
    }
}
