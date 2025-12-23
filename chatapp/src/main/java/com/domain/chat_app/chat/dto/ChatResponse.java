package com.domain.chat_app.chat.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatResponse {

    private String id;

    private String name;

    private long unreadCount;

    private String lastMessage;

    private  String lastMessageTime;

    private boolean isRecipientOnline;

    private String senderId;

    private String recipientId;
}
