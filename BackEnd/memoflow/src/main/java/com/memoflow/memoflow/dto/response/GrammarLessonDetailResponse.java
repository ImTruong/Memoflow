package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarLessonDetailResponse {
    private Long id;
    private String title;
    private String engTitle;
    private String description;
    private List<Map<String, Object>> sections;
    private Long suggestedPracticeId;
    private List<GrammarPracticeTaskResponse> practiceTasks;
}
