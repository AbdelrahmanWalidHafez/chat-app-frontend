package com.domain.chat_app.message.dto;

import com.domain.chat_app.message.model.enums.MessageType;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageRequest {

    private String content;

    private String senderId;

    private String receiverId;

    private MessageType messageType;

    private String chatId;
}
