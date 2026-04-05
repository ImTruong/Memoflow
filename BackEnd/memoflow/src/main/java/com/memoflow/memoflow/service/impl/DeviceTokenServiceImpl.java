package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.entity.DeviceToken;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.DeviceTokenRepository;
import com.memoflow.memoflow.repository.UserRepository;
import com.memoflow.memoflow.service.DeviceTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class DeviceTokenServiceImpl implements DeviceTokenService {

    private final DeviceTokenRepository deviceTokenRepository;
    private final UserRepository userRepository;

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

    @Override
    public void registerSocketDevice(String sessionId, Long userId, String platform) {
        if (sessionId == null || userId == null) {
            log.warn("Cannot register socket device because sessionId or userId is null");
            return;
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User not found: {}", userId);
            return;
        }

        DeviceToken token = deviceTokenRepository.findBySocketSessionId(sessionId)
                .orElseGet(() -> DeviceToken.builder()
                        .socketSessionId(sessionId)
                        .token(sessionId)
                        .build());

        token.setUser(user);
        token.setPlatform(platform);
        deviceTokenRepository.save(token);

        log.info("Registered socket device for user: {} with session: {}", userId, sessionId);
    }
}
