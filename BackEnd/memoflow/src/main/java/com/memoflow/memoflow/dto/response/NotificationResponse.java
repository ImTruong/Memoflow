package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String message;
    private String imageUrl;
    private Map<String, Object> data;
    private Boolean isRead;
    private LocalDateTime createdAt;

    // Icon metadata based on notification type
    private String icon;
    private String bgColor;
    private String iconColor;
    private Boolean hasGradient;
    private Boolean hasAction;
    private String actionText;
}
