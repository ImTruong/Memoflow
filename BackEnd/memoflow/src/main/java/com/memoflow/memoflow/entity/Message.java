package com.memoflow.memoflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
// Entity luu mot tin nhan trong phien chat AI.
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Khoa chinh cua tin nhan.
    private Long id;

    // Vai tro nguoi gui: user hoac assistant.
    @Column(nullable = false)
    private String role;

    // Noi dung tin nhan.
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // Thoi diem tao tin nhan.
    @Column(name = "created_at", nullable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    // Phien chat chua tin nhan nay.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_session_id", nullable = false)
    private ChatSession chatSession;
}
