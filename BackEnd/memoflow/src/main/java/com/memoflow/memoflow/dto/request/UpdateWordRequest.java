package com.memoflow.memoflow.dto.request;

import org.springframework.web.multipart.MultipartFile;

import com.memoflow.memoflow.annotation.ValidImage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWordRequest {

    private String name;

    private String ipa;

    private String audio;

    @ValidImage
    private MultipartFile image;

    private String audioUrl;

    private String example;

    private String definition;

}
