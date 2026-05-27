package com.memoflow.memoflow.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
// DTO nhan tien do Word Hunt tu mobile gui ve backend sau khi choi.
public class UpdateWordHuntProgressRequest {

    // Trang thai hoan thanh man choi.
    private Boolean isCompleted;

    // Phan tram tien do hien tai cua man choi.
    @Min(value = 0, message = "Progress percent must be at least 0")
    @Max(value = 100, message = "Progress percent must be at most 100")
    private Double progressPercent;

    // Diem so user dat duoc trong luot choi.
    @Min(value = 0, message = "Score must be non-negative")
    private Integer score;

    // So luot goi y da dung trong ngay.
    @Min(value = 0, message = "Hints used today must be non-negative")
    private Integer hintsUsedToday;

    // Ngay ghi nhan so luot goi y, dung de reset theo ngay o frontend/backend.
    private LocalDate hintsUsedDate;
}
