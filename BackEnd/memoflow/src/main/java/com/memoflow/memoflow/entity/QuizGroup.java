package com.memoflow.memoflow.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "quiz_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type;

    @ManyToOne(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinColumn(name = "audio_media_id")
    private Media audio;

    @ManyToOne(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinColumn(name = "image_media_id")
    private Media image;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_lesson_id", nullable = false)
    private LearningLesson learningLesson;

    @OneToMany(mappedBy = "quizGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizQuestion> quizQuestions;

    @Column(name="transcript", columnDefinition = "TEXT")
    private String transcript;

    @Column(name="translation", columnDefinition = "TEXT")
    private String translation;
}
