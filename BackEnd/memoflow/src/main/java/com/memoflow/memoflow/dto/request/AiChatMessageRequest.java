package com.memoflow.memoflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
// DTO nhan du lieu luu mot tin nhan trong phien chat AI.
public class AiChatMessageRequest {

    // Vai tro nguoi gui tin nhan, chi chap nhan user hoac assistant.
    @NotBlank(message = "Message role is required")
    @Pattern(regexp = "(?i)user|assistant", message = "Role must be either 'user' or 'assistant'")
    private String role;

    // Noi dung tin nhan, gioi han de tranh payload qua lon khi luu database.
    @NotBlank(message = "Message content is required")
    @Size(max = 6000, message = "Message content must be at most 6000 characters")
    private String content;
}
