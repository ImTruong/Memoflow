package com.memoflow.memoflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "chat_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
// Entity luu mot phien chat AI cua user.
public class ChatSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Khoa chinh cua phien chat.
    private Long id;

    // Tieu de phien chat hien thi tren lich su.
    @Column(columnDefinition = "TEXT")
    private String title;

    // Thoi diem tao phien chat.
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Thoi diem phien chat duoc cap nhat gan nhat.
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // User so huu phien chat.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
