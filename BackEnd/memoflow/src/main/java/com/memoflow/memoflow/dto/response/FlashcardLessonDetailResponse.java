package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardLessonDetailResponse {
    private FlashcardLessonResponse lessonInfo;
    private PageResponse<WordResponse> words;
}
