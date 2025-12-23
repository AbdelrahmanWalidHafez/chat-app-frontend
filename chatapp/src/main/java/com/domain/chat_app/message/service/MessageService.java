package com.domain.chat_app.message.service;

import com.domain.chat_app.message.dto.MessageRequest;
import com.domain.chat_app.message.dto.MessageResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MessageService {

    void uploadMediaMessage(String chatId, MultipartFile file, Authentication authentication);

    void setMessageToSeen(String chatId, Authentication authentication);

    List<MessageResponse> findChatMessages(String chatId);

    void save(MessageRequest messageRequest);

    void updateMessage(Long messageId, String content, Authentication authentication);

    void deleteMessage(Long messageId, Authentication authentication);
}
