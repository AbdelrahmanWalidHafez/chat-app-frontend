package com.domain.chat_app.ws.notification.model;

import com.domain.chat_app.message.model.enums.MessageType;
import com.domain.chat_app.ws.notification.model.enums.NotificationType;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Notification {

    private String chatId;

    private String  content;

    private String  senderId;

    private String  recipientId;

    private String  chatName;

    private MessageType messageType;

    private NotificationType type;

    private byte[] media;
}
