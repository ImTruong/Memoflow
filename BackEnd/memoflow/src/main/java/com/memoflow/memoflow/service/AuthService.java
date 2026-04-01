package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.request.LoginRequest;
import com.memoflow.memoflow.dto.request.RegisterRequest;
import com.memoflow.memoflow.dto.request.VerifyAccountRequest;
import com.memoflow.memoflow.dto.response.LoginResponse;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Map;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    LoginResponse loginWithGoogle(String idToken) throws GeneralSecurityException, IOException;

    void register(RegisterRequest request);

    LoginResponse verifyAccount(VerifyAccountRequest request);

    void forgotPassword(Map<String,String> request);

    void restPassword(Map<String,String> request);

}
