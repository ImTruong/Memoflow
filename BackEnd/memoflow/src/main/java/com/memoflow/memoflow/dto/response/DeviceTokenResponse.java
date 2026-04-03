package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceTokenResponse {
    private Long id;
    private String platform;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
