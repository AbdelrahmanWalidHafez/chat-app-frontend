package com.domain.chat_app.message.dto;

import com.domain.chat_app.message.model.enums.MessageState;
import com.domain.chat_app.message.model.enums.MessageType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageResponse {

    private Long id;

    private String content;

    private MessageType type;

    private MessageState state;

    private  String senderId;

    private String recipientId;

    private LocalDateTime createdAt;

    private byte[]media;
}
