package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarPracticeOverviewResponse {
    private Long id;
    private String title;
    private String description;
    private Integer overallProgress;
    private List<GrammarPracticeTaskResponse> tasks;
}
