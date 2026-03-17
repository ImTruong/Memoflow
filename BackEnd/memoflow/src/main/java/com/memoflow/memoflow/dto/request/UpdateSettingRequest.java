package com.memoflow.memoflow.dto.request;

import lombok.Data;
import java.time.LocalTime;

@Data
public class UpdateSettingRequest {
    private Boolean studyReminderEnabled;
    private Boolean streakReminderEnabled;
    private Boolean timeWindow;
    private LocalTime morningReminderTime;
    private LocalTime eveningReminderTime;
}
