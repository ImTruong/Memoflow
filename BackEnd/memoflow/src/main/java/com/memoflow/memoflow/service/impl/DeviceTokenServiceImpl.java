package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.entity.DeviceToken;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.DeviceTokenRepository;
import com.memoflow.memoflow.service.DeviceTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class DeviceTokenServiceImpl implements DeviceTokenService {

    private final DeviceTokenRepository deviceTokenRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DeviceToken> findByUserId(Long userId) {
        return deviceTokenRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DeviceToken> findByToken(String token) {
        return deviceTokenRepository.findByToken(token);
    }

    @Override
    public DeviceToken save(DeviceToken deviceToken) {
        return deviceTokenRepository.save(deviceToken);
    }

    @Override
    public void deleteByToken(String token) {
        if (!deviceTokenRepository.existsByToken(token)) {
            throw new ResourceNotFoundException("DeviceToken", "token", token);
        }
        deviceTokenRepository.deleteByToken(token);
    }

    @Override
    public void deleteById(Long id) {
        deviceTokenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeviceToken", "id", id));
        deviceTokenRepository.deleteById(id);
    }
}
