package com.memoflow.memoflow.validator;

import com.memoflow.memoflow.annotation.ValidImage;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

public class ImageFileValidator implements ConstraintValidator<ValidImage, MultipartFile> {
    @Override
    public boolean isValid(MultipartFile file, ConstraintValidatorContext context) {
        if (file == null || file.isEmpty())
            return true; // Cho phép null nếu không bắt buộc
        List<String> validTypes = Arrays.asList("image/png", "image/jpeg", "image/jpg");
        return validTypes.contains(file.getContentType());
    }
}