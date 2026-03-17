package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    List<ChatSession> findByUserId(Long userId);

    List<ChatSession> findByUserIdOrderByCreatedAtDesc(Long userId);
}
