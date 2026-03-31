package com.memoflow.memoflow.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateAiChatSessionRequest {

    @Size(max = 120, message = "Session title must be at most 120 characters")
    private String title;
}
