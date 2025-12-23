package com.domain.chat_app.chat.mapper;

import com.domain.chat_app.chat.dto.ChatResponse;
import com.domain.chat_app.chat.model.Chat;
import org.springframework.stereotype.Component;

@Component
public class ChatMapper {
    public ChatResponse toChatResponse(Chat c, String userId) {
        return  ChatResponse
                .builder()
                .id(c.getId())
                .name(c.getChatName(userId))
                .unreadCount(c.getUnreadMessagesCount(userId))
                .lastMessage(c.getLastMessage())
                .isRecipientOnline(c.getRecipient().isUserOnline())
                .senderId(c.getSender().getId())
                .recipientId(c.getRecipient().getId())
                .build();
    }
}
