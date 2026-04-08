package com.memoflow.memoflow.dto.request;

import lombok.Data;

@Data
public class VerifyAccountRequest {
    private String code;
    private String email;
    private String password;
}
