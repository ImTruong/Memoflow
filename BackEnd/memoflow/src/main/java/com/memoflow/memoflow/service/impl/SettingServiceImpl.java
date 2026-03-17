package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.dto.request.UpdateSettingRequest;
import com.memoflow.memoflow.dto.response.SettingResponse;
import com.memoflow.memoflow.entity.Setting;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.repository.SettingRepository;
import com.memoflow.memoflow.repository.UserRepository;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SettingServiceImpl implements SettingService {

    private final SettingRepository settingRepository;
    private final UserRepository userRepository;

    @Override
    public SettingResponse getSettings(UserPrincipal userPrincipal) {
        Setting setting = settingRepository.findById(userPrincipal.getId())
                .orElseGet(() -> createDefaultSettings(userPrincipal.getId()));
        return mapToResponse(setting);
    }

    @Override
    public SettingResponse updateSettings(UpdateSettingRequest request, UserPrincipal userPrincipal) {
        Setting setting = settingRepository.findById(userPrincipal.getId())
                .orElseGet(() -> createDefaultSettings(userPrincipal.getId()));

        if (request.getStudyReminderEnabled() != null) setting.setStudyReminderEnabled(request.getStudyReminderEnabled());
        if (request.getStreakReminderEnabled() != null) setting.setStreakReminderEnabled(request.getStreakReminderEnabled());
        if (request.getTimeWindow() != null) setting.setTimeWindow(request.getTimeWindow());
        if (request.getMorningReminderTime() != null) setting.setMorningReminderTime(request.getMorningReminderTime());
        if (request.getEveningReminderTime() != null) setting.setEveningReminderTime(request.getEveningReminderTime());

        Setting saved = settingRepository.save(setting);
        return mapToResponse(saved);
    }

    private SettingResponse mapToResponse(Setting setting) {
        return SettingResponse.builder()
                .studyReminderEnabled(setting.getStudyReminderEnabled())
                .streakReminderEnabled(setting.getStreakReminderEnabled())
                .timeWindow(setting.getTimeWindow())
                .morningReminderTime(setting.getMorningReminderTime())
                .eveningReminderTime(setting.getEveningReminderTime())
                .build();
    }

    private Setting createDefaultSettings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        Setting setting = Setting.builder()
                .user(user)
                .studyReminderEnabled(true)
                .streakReminderEnabled(true)
                .timeWindow(true)
                .morningReminderTime(java.time.LocalTime.of(8, 0))
                .eveningReminderTime(java.time.LocalTime.of(21, 0))
                .build();
        
        return settingRepository.save(setting);
    }
}
