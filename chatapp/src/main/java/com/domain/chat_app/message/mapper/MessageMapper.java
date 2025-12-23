package com.domain.chat_app.message.mapper;

import com.domain.chat_app.file.utils.FileUtils;
import com.domain.chat_app.message.dto.MessageResponse;
import com.domain.chat_app.message.model.Message;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {

    public MessageResponse toMessageResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .content(message.getContent())
                .recipientId(message.getRecipientId())
                .state(message.getState())
                .type(message.getType())
                .senderId(message.getSenderId())
                .createdAt(message.getCreatedDate())
                .media(FileUtils.readFileFromLocation(message.getMediaFilePath()))
                .build();
    }


}
