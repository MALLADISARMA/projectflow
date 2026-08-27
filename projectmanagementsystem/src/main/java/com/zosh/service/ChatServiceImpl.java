package com.zosh.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zosh.modal.Chat;
import com.zosh.repository.ChatRepository;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private ChatRepository chatRepository;

    
    public Chat createChat(Chat chat) {
        return chatRepository.save(chat);
    }
}