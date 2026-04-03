package com.memoflow.memoflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDeviceTokenRequest {

    @NotBlank(message = "Device token is required")
    private String token;

    @NotBlank(message = "Platform is required")
    private String platform; // "android", "ios", "web"
}
