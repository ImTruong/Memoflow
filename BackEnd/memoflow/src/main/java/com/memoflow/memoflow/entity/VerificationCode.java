package com.memoflow.memoflow.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "verification_code")
@Getter
@Setter
public class VerificationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "value")
    private String value;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "create_at")
    private LocalDateTime createAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "new_password")
    private String newPassword;

    @PrePersist
    @PreUpdate
    private void onCreate() {
        createAt = LocalDateTime.now();
        expiresAt = LocalDateTime.now().plusMinutes(2);
    }

}
