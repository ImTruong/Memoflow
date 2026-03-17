package com.memoflow.memoflow.dto.request;

import java.time.LocalDate;
import org.springframework.web.multipart.MultipartFile;
import com.memoflow.memoflow.annotation.ValidImage;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserProfileRequest {

    private String name;

    @Email(message = "Email should be valid")
    private String email;

    private LocalDate dateOfBirth;

    @ValidImage
    private MultipartFile avatar;
}
