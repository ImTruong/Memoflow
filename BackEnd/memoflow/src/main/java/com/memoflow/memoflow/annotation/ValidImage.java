package com.memoflow.memoflow.annotation;

import jakarta.validation.Constraint;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import com.memoflow.memoflow.validator.ImageFileValidator;

@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ImageFileValidator.class)
public @interface ValidImage {
    String message() default "Invalid image file (only png, jpg, jpeg)";

    Class<?>[] groups() default {};

    Class<?>[] payload() default {};
}