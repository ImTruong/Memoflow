package com.memoflow.memoflow.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
// DTO nhan du lieu tao moi hoac cap nhat man choi Word Hunt tu admin.
public class UpsertWordHuntLessonRequest {

    // Tieu de hien thi cua man choi.
    @NotBlank(message = "Title is required")
    private String title;

    // Mo ta ngan cho man choi, co the de trong.
    private String description;

    // Ma chu de dung de frontend phan nhom va xu ly logic.
    @NotBlank(message = "Category key is required")
    private String categoryKey;

    // Ten chu de hien thi cho nguoi dung.
    @NotBlank(message = "Category label is required")
    private String categoryLabel;

    // Kich thuoc bang chu cai, gioi han de game khong qua nho hoac qua lon.
    @Min(value = 6, message = "Board size must be at least 6")
    @Max(value = 20, message = "Board size must be at most 20")
    @NotNull(message = "Board size is required")
    private Integer boardSize;

    // Thoi gian choi tinh bang giay.
    @Min(value = 30, message = "Time limit must be at least 30 seconds")
    @NotNull(message = "Time limit is required")
    private Integer timeLimitSeconds;

    // So tu nguoi choi can tim de dat muc tieu bai choi.
    @Min(value = 1, message = "Target word count must be at least 1")
    @NotNull(message = "Target word count is required")
    private Integer targetWordCount;

    // So luot goi y toi da moi ngay cho mot man choi.
    @Min(value = 0, message = "Max hints per day must be non-negative")
    @NotNull(message = "Max hints per day is required")
    private Integer maxHintsPerDay;

    // Noi dung muc tieu hien thi trong man choi.
    @NotBlank(message = "Objective text is required")
    private String objectiveText;

    // Dieu kien mo khoa neu man choi can hien thi rang buoc truoc do.
    private String unlockRequirementText;

    // Danh sach tu can an trong bang chu cai.
    @NotEmpty(message = "Words are required")
    private List<@NotBlank(message = "Word must not be blank") String> words;
}
