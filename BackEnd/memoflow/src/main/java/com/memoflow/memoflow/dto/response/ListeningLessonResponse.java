package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ListeningLessonResponse {
    private Long id;
    private String title;
    private Boolean isCompleted;
}
