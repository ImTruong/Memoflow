package com.memoflow.memoflow.entity;

import java.util.List;
import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "learning_lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// Entity luu bai hoc/cau hinh game chung trong bang learning_lessons.
public class LearningLesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Khoa chinh cua lesson.
    private Long id;

    // Tieu de bai hoc hoac man choi.
    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;

    // Loai lesson, vi du TRUYEN_CHEM, WORD_RACE, WORD_HUNT.
    @Column(nullable = false)
    private String type;

    // Mo ta ngan cua lesson.
    @Column(columnDefinition = "TEXT")
    private String description;

    // Co xoa mem neu module khac can an lesson thay vi xoa vat ly.
    @Column(name = "is_deleted", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean deleted = false;

    // Anh minh hoa cua lesson, dung chinh cho truyen chem.
    @ManyToOne(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinColumn(name = "image_media_id")
    private Media image;

    // Noi dung JSON linh hoat cho tung loai lesson.
    @Column(columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> content;

    // Hoat dong hoc tap cha cua lesson.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_activity_id", nullable = false)
    private LearningActivity learningActivity;

    // User tao lesson, dung cho noi dung admin/user tao.
    @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "user_id", nullable = false)
    @JoinColumn(name = "user_id")
    private User creator;

    // Cac nhom quiz lien ket neu lesson duoc dung cho bai quiz.
    @OneToMany(mappedBy = "learningLesson", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizGroup> quizGroups;

}
