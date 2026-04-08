package com.memoflow.memoflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AiChatMessageRequest {

    @NotBlank(message = "Message role is required")
    @Pattern(regexp = "(?i)user|assistant", message = "Role must be either 'user' or 'assistant'")
    private String role;

    @NotBlank(message = "Message content is required")
    @Size(max = 6000, message = "Message content must be at most 6000 characters")
    private String content;
}
