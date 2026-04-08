package com.memoflow.memoflow.enums;

import lombok.Getter;

@Getter
public enum NotificationType {
    STUDY_REMINDER("Nhắc nhở học tập", "book", "#FFF3E0", "#FF9800", false),
    STREAK_REMINDER("Duy trì chuỗi học tập!", "fire", "#E8F5E9", "#4CAF50", true),
    NEW_VOCABULARY("Bộ từ vựng mới!", "gift", "#F3E5F5", "#9C27B0", false),
    ACHIEVEMENT("Hoàn thành mục tiêu", "trophy", "#E3F2FD", "#2196F3", false),
    GENERAL("Thông báo", "bell", "#F5F5F5", "#757575", false);

    private final String defaultTitle;
    private final String icon;
    private final String bgColor;
    private final String iconColor;
    private final boolean hasGradient;

    NotificationType(String defaultTitle, String icon, String bgColor, String iconColor, boolean hasGradient) {
        this.defaultTitle = defaultTitle;
        this.icon = icon;
        this.bgColor = bgColor;
        this.iconColor = iconColor;
        this.hasGradient = hasGradient;
    }

    public static NotificationType fromString(String type) {
        if (type == null) {
            return GENERAL;
        }
        try {
            return NotificationType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return GENERAL;
        }
    }
}
