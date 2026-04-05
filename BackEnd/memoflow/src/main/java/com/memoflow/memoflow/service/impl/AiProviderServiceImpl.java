package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.service.AiProviderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiProviderServiceImpl implements AiProviderService {

    @Value("${expo.public.free-llm.api-key:apf_h4p00jki78k1ef8qokub5ite}")
    private String apiKey;

    @Value("${expo.public.free-llm.url:https://apifreellm.com/api/v1/chat}")
    private String apiUrl;

    @Value("${expo.public.free-llm.model:apifreellm}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String generateResponse(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("message", prompt);
            body.put("model", model);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(apiUrl, entity, (Class<Map<String, Object>>) (Class<?>) Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> data = response.getBody();
                if (data.containsKey("response")) {
                    return data.get("response").toString().trim();
                }
            }
            log.warn("Empty or failed AI response from FreeLLM: {}", response.getStatusCode());
            return null;
        } catch (Exception e) {
            log.error("AI Provider call failed", e);
            return null;
        }
    }
}
