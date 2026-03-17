package com.memoflow.memoflow.controller;

import com.memoflow.memoflow.dto.request.UpdateSettingRequest;
import com.memoflow.memoflow.dto.response.ApiResponse;
import com.memoflow.memoflow.dto.response.SettingResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
public class SettingController {

    private final SettingService settingService;

    @GetMapping
    public ResponseEntity<ApiResponse<SettingResponse>> getSettings(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        SettingResponse response = settingService.getSettings(userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Settings fetched successfully"));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<SettingResponse>> updateSettings(
            @RequestBody UpdateSettingRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        SettingResponse response = settingService.updateSettings(request, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Settings updated successfully"));
    }
}
