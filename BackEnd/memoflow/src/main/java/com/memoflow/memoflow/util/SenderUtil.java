package com.memoflow.memoflow.util;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SenderUtil {

    private final MailSender mailSender;

    public void sendVerificationCode(String email, String code) {
        String subject = "Xác nhận đăng ký tài khoản";
        String message = "Mã xác thực của bạn là: " + code;
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(email);
        mail.setSubject(subject);
        mail.setText(message);
        mailSender.send(mail);
    }

    public void sendPasswordResetCode(String email, String code) {
        String subject = "Xác nhận đổi mật khẩu";
        String message = "Mã xác nhận đổi mật khẩu của bạn là: " + code;
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(email);
        mail.setSubject(subject);
        mail.setText(message);
        mailSender.send(mail);
    }

}
