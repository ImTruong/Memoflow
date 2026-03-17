package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.request.UpdateSettingRequest;
import com.memoflow.memoflow.dto.response.SettingResponse;
import com.memoflow.memoflow.security.UserPrincipal;

public interface SettingService {
    SettingResponse getSettings(UserPrincipal userPrincipal);
    SettingResponse updateSettings(UpdateSettingRequest request, UserPrincipal userPrincipal);
}
