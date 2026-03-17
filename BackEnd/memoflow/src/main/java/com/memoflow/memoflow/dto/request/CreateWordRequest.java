package com.memoflow.memoflow.dto.request;

import org.springframework.web.multipart.MultipartFile;

import com.memoflow.memoflow.annotation.ValidImage;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateWordRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String ipa;

    private String audio;

    @ValidImage
    private MultipartFile image;

    private String audioUrl;

    @NotBlank(message = "Example is required")
    private String example;

    @NotBlank(message = "Definition is required")
    private String definition;

}
