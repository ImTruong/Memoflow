package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarTopicResponse {
    private Long id;
    private String title;
    private String description;
    private String progressLabel;
    private Integer progressPercent;
}
