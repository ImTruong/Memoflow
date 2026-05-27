package com.memoflow.memoflow.controller;

import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.memoflow.memoflow.dto.request.AiChatMessageRequest;
import com.memoflow.memoflow.dto.request.CreateAiChatSessionRequest;
import com.memoflow.memoflow.dto.response.AiChatMessageResponse;
import com.memoflow.memoflow.dto.response.AiChatSessionResponse;
import com.memoflow.memoflow.dto.response.ApiResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.AiChatService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
// Controller cung cap API chatbot: sinh cau tra loi AI, quan ly phien chat va tin nhan.
public class AiChatController {

    private final AiChatService aiChatService;
    private final com.memoflow.memoflow.service.AiProviderService aiProviderService;

    // API goi provider AI ngoai de sinh cau tra loi tu prompt cua user, co the cau hinh sang Gemini.
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<String>> generateReply(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        String result = aiProviderService.generateResponse(prompt);
        if (result != null) {
            return ResponseEntity.ok(ApiResponse.success(result, "AI reply generated successfully"));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to generate AI reply", HttpStatus.INTERNAL_SERVER_ERROR.value()));
    }

    // API lay danh sach phien chat cua user dang dang nhap.
    @GetMapping("/chat-sessions")
    public ResponseEntity<ApiResponse<List<AiChatSessionResponse>>> getSessions(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AiChatSessionResponse> sessions = aiChatService.getUserSessions(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(sessions, "Chat sessions retrieved successfully"));
    }

    // API tao phien chat moi, title co the bo trong de service gan mac dinh.
    @PostMapping("/chat-sessions")
    public ResponseEntity<ApiResponse<AiChatSessionResponse>> createSession(
            @Valid @RequestBody(required = false) CreateAiChatSessionRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String title = request == null ? null : request.getTitle();
        AiChatSessionResponse response = aiChatService.createSession(userPrincipal.getId(), title);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Chat session created successfully"));
    }

    // API lay toan bo tin nhan trong mot phien chat thuoc user dang dang nhap.
    @GetMapping("/chat-sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<List<AiChatMessageResponse>>> getMessages(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AiChatMessageResponse> messages = aiChatService.getSessionMessages(userPrincipal.getId(), sessionId);
        return ResponseEntity.ok(ApiResponse.success(messages, "Messages retrieved successfully"));
    }

    // API luu tin nhan user hoac assistant vao lich su cua phien chat.
    @PostMapping("/chat-sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<AiChatMessageResponse>> saveMessage(
            @PathVariable Long sessionId,
            @Valid @RequestBody AiChatMessageRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AiChatMessageResponse response = aiChatService.saveMessage(
                userPrincipal.getId(),
                sessionId,
                request.getRole(),
                request.getContent());
        return ResponseEntity.ok(ApiResponse.success(response, "Message saved successfully"));
    }
}
