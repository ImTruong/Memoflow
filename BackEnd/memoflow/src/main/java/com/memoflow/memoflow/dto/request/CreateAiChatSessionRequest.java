package com.memoflow.memoflow.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
// DTO nhan du lieu tao phien chat AI moi.
public class CreateAiChatSessionRequest {

    // Tieu de phien chat, co the bo trong de backend tu gan mac dinh.
    @Size(max = 120, message = "Session title must be at most 120 characters")
    private String title;
}
