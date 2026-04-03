package com.memoflow.memoflow.service;

import com.memoflow.memoflow.entity.DeviceToken;

import java.util.List;
import java.util.Optional;

public interface DeviceTokenService {

    List<DeviceToken> findByUserId(Long userId);

    Optional<DeviceToken> findByToken(String token);

    DeviceToken save(DeviceToken deviceToken);

    void deleteByToken(String token);

    void deleteById(Long id);

    void registerSocketDevice(String sessionId, Long userId, String platform);
}
