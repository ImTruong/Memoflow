package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByChatSessionId(Long chatSessionId);

    List<Message> findByChatSessionIdOrderByCreatedAtAsc(Long chatSessionId);
}
