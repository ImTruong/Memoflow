package com.memoflow.memoflow.service;

// Interface dong goi viec goi AI provider ngoai nhu Gemini/FreeLLM.
public interface AiProviderService {
    // Sinh cau tra loi tu prompt da duoc frontend/backend tao san.
    String generateResponse(String prompt);
}
