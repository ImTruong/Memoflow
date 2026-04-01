package com.memoflow.memoflow.controller;

import com.memoflow.memoflow.dto.request.LoginGoogleRequest;
import com.memoflow.memoflow.dto.request.LoginRequest;
import com.memoflow.memoflow.dto.request.RegisterRequest;
import com.memoflow.memoflow.dto.request.VerifyAccountRequest;
import com.memoflow.memoflow.dto.response.ApiResponse;
import com.memoflow.memoflow.dto.response.LoginResponse;
import com.memoflow.memoflow.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successfully"));
    }

    @PostMapping("/login-google")
    public ResponseEntity<ApiResponse<LoginResponse>> loginWithGoogle(@RequestBody LoginGoogleRequest request) throws GeneralSecurityException, IOException {
        LoginResponse response = authService.loginWithGoogle(request.getIdToken());
        return ResponseEntity.ok(ApiResponse.success(response, "Login successfully"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(
            @Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Account created, awaiting verification"));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<LoginResponse>> verifyAccount(
            @RequestBody VerifyAccountRequest request) {
        LoginResponse response = authService.verifyAccount(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Register successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @RequestBody Map<String, String> request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Awaiting verification"));
    }

    @PostMapping("/verify-reset-password")
    public ResponseEntity<ApiResponse<Void>> verifyResetPassword(
            @RequestBody Map<String, String> request) {
        authService.restPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Reset password successfully"));
    }

}
