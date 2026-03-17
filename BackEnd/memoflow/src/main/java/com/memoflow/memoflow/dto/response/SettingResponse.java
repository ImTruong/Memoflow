package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettingResponse {
    private Boolean studyReminderEnabled;
    private Boolean streakReminderEnabled;
    private Boolean timeWindow;
    private LocalTime morningReminderTime;
    private LocalTime eveningReminderTime;
}
