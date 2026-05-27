package com.memoflow.memoflow.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
// DTO nhan du lieu tao moi hoac cap nhat man choi Word Race tu admin.
public class UpsertWordRaceLessonRequest {

    // Tieu de hien thi cua man choi.
    @NotBlank(message = "Title is required")
    private String title;

    // Mo ta ngan cho man choi, co the de trong.
    private String description;

    // Diem muc tieu ma user hoac bot can dat de chien thang.
    @NotNull(message = "Target score is required")
    @Min(value = 1, message = "Target score must be at least 1")
    private Integer targetScore;

    // Thoi gian toi da cho moi luot nhap tu, tinh bang giay.
    @NotNull(message = "Time limit is required")
    @Min(value = 3, message = "Time limit must be at least 3 seconds")
    private Integer timeLimit;

    // Cac ky tu ket thuc bi cam de tranh tu qua kho noi tiep.
    private List<@NotBlank(message = "Forbidden ending must not be blank") String> forbiddenEndings;
}
