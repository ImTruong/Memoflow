package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WordResponse {
    private Long id;
    private String name;
    private String ipa;
    private String imageUrl;
    private String example;
    private String definition;
    private String audioUrl;
    private Long flashcardLessonId;
}
