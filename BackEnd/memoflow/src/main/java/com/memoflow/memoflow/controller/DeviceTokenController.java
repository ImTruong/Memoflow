package com.memoflow.memoflow.controller;

import com.memoflow.memoflow.dto.request.RegisterDeviceTokenRequest;
import com.memoflow.memoflow.dto.response.ApiResponse;
import com.memoflow.memoflow.dto.response.DeviceTokenResponse;
import com.memoflow.memoflow.entity.DeviceToken;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.repository.UserRepository;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.DeviceTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for managing device tokens for push notifications
 */
@RestController
@RequestMapping("/device-tokens")
@RequiredArgsConstructor
@Slf4j
public class DeviceTokenController {

    private final DeviceTokenService deviceTokenService;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    /**
     * Register a new device token for push notifications
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DeviceTokenResponse>> registerDeviceToken(
            @Valid @RequestBody RegisterDeviceTokenRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        log.info("Registering device token for user: {}", userPrincipal.getId());

        // Check if token already exists for this user
        deviceTokenService.findByToken(request.getToken())
                .ifPresent(existingToken -> {
                    if (existingToken.getUser().getId().equals(userPrincipal.getId())) {
                        log.info("Token already registered for user");
                        return;
                    }
                    // Token exists for different user - delete old registration
                    deviceTokenService.deleteByToken(request.getToken());
                });

        User user = userRepository.getReferenceById(userPrincipal.getId());

        DeviceToken deviceToken = DeviceToken.builder()
                .token(request.getToken())
                .platform(request.getPlatform())
                .user(user)
                .build();

        DeviceToken savedToken = deviceTokenService.save(deviceToken);
        DeviceTokenResponse response = modelMapper.map(savedToken, DeviceTokenResponse.class);

        log.info("Successfully registered device token for user: {}", userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Device token registered successfully"));
    }

    /**
     * Get all device tokens for current user
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DeviceTokenResponse>>> getMyDeviceTokens(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        List<DeviceToken> tokens = deviceTokenService.findByUserId(userPrincipal.getId());
        List<DeviceTokenResponse> responses = tokens.stream()
                .map(token -> modelMapper.map(token, DeviceTokenResponse.class))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses, "Device tokens retrieved successfully"));
    }

    /**
     * Delete a device token (unregister from push notifications)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDeviceToken(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        log.info("Deleting device token {} for user: {}", id, userPrincipal.getId());
        deviceTokenService.deleteById(id);

        return ResponseEntity.ok(ApiResponse.success(null, "Device token deleted successfully"));
    }

    /**
     * Delete device token by token string (useful for logout)
     */
    @DeleteMapping("/token/{token}")
    public ResponseEntity<ApiResponse<Void>> deleteDeviceTokenByToken(
            @PathVariable String token,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        log.info("Deleting device token for user: {}", userPrincipal.getId());
        deviceTokenService.deleteByToken(token);

        return ResponseEntity.ok(ApiResponse.success(null, "Device token deleted successfully"));
    }
}
