package com.memoflow.memoflow.service;

import com.memoflow.memoflow.entity.Message;

import java.util.List;
import java.util.Optional;

public interface MessageService {

    List<Message> findByChatSessionId(Long chatSessionId);

    Optional<Message> findById(Long id);

    Message save(Message message);

    void deleteById(Long id);
}
