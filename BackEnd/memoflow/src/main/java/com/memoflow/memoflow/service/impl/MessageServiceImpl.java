package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.entity.Message;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.MessageRepository;
import com.memoflow.memoflow.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Message> findByChatSessionId(Long chatSessionId) {
        return messageRepository.findByChatSessionIdOrderByCreatedAtAsc(chatSessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Message> findById(Long id) {
        return messageRepository.findById(id);
    }

    @Override
    public Message save(Message message) {
        return messageRepository.save(message);
    }

    @Override
    public void deleteById(Long id) {
        messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message", "id", id));
        messageRepository.deleteById(id);
    }
}
