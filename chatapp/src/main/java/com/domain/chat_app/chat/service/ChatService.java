package com.domain.chat_app.chat.service;

import com.domain.chat_app.chat.dto.ChatResponse;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface ChatService {
    List<ChatResponse> getChatsByReceiverId(Authentication currentUser);
    String createChat(String senderId, String recipientId);
}
