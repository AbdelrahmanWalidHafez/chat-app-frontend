package com.domain.chat_app.message.service.impl;

import com.domain.chat_app.chat.model.Chat;
import com.domain.chat_app.chat.repository.ChatRepository;
import com.domain.chat_app.file.service.FileService;
import com.domain.chat_app.file.utils.FileUtils;
import com.domain.chat_app.message.dto.MessageRequest;
import com.domain.chat_app.message.dto.MessageResponse;
import com.domain.chat_app.message.mapper.MessageMapper;
import com.domain.chat_app.message.model.Message;
import com.domain.chat_app.message.model.enums.MessageState;
import com.domain.chat_app.message.model.enums.MessageType;
import com.domain.chat_app.message.repository.MessageRepository;
import com.domain.chat_app.message.service.MessageService;
import com.domain.chat_app.user.sync.interceptor.service.UserSynchronizer;
import com.domain.chat_app.ws.notification.model.Notification;
import com.domain.chat_app.ws.notification.model.enums.NotificationType;
import com.domain.chat_app.ws.notification.service.impl.NotificationServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    private final ChatRepository chatRepository;

    private final MessageMapper messageMapper;

    private final FileService fileService;

    private final NotificationServiceImpl notificationService;

    private final UserSynchronizer userSynchronizer;

    public void save(MessageRequest messageRequest) {
        Chat chat =chatRepository.findById(messageRequest.getChatId())
                .orElseThrow(()->new EntityNotFoundException("chat not found"));
        Message message = new Message();
        message.setContent(messageRequest.getContent());
        message.setChat(chat);
        message.setSenderId(messageRequest.getSenderId());
        message.setRecipientId(messageRequest.getReceiverId());
        message.setType(messageRequest.getMessageType());
        message.setState(MessageState.SENT);
        messageRepository.save(message);
        userSynchronizer.updateLastSeen(messageRequest.getSenderId());
        Notification notification = Notification.builder()
                .chatId(chat.getId())
                .messageType(message.getType())
                .content(message.getContent())
                .senderId(message.getSenderId())
                .recipientId(message.getRecipientId())
                .type(NotificationType.MESSAGE)
                .chatName(chat.getChatName(message.getSenderId()))
                .build();
        notificationService.sendNotification(notification, message.getRecipientId());
    }

    public List<MessageResponse> findChatMessages(String chatId){

        return messageRepository
                .findMessageByChatId(chatId)
                .stream()
                .map(messageMapper::toMessageResponse)
                .toList();

    }

    @Transactional
    public void setMessageToSeen(String chatId, Authentication authentication) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(()->new EntityNotFoundException("chat not found"));
        final String recipientId = getRecipientId(chat,authentication);
        messageRepository.setMessagesToSeen(chat.getId(),MessageState.SEEN);
        Notification notification = Notification.builder()
                .chatId(chat.getId())
                .senderId(getSenderId(chat,authentication))
                .recipientId(recipientId)
                .type(NotificationType.SEEN)
                .build();
        notificationService.sendNotification(notification, recipientId);
    }

    public void uploadMediaMessage(String chatId, MultipartFile file,Authentication authentication) {
        Chat chat=chatRepository.findById(chatId)
                .orElseThrow(()->new EntityNotFoundException("chat not found"));
        final String senderId = getSenderId(chat,authentication);
        final String recipientId = getRecipientId(chat,authentication);
        final String filePath = fileService.saveFile(file,senderId);
        Message message = new Message();
        message.setChat(chat);
        message.setSenderId(senderId);
        message.setRecipientId(recipientId);
        message.setType(determineMessageType(file.getContentType(), file.getOriginalFilename()));
        message.setState(MessageState.SENT);
        message.setMediaFilePath(filePath);
        message.setContent(file.getOriginalFilename() != null ? file.getOriginalFilename() : "File attachment");
        messageRepository.save(message);
        userSynchronizer.updateLastSeen(senderId);
        Notification notification = Notification.builder()
                .chatId(chat.getId())
                .messageType(message.getType())
                .senderId(senderId)
                .recipientId(recipientId)
                .type(mapMessageTypeToNotificationType(message.getType()))
                .media(FileUtils.readFileFromLocation(filePath))
                .build();
        notificationService.sendNotification(notification, recipientId);
    }

    private MessageType determineMessageType(String contentType, String filename) {
        if (contentType != null && !contentType.trim().isEmpty()) {
            String lowerContentType = contentType.toLowerCase().trim();
            if (lowerContentType.startsWith("image/")) {
                return MessageType.IMAGE;
            }
            if (lowerContentType.startsWith("audio/")) {
                return MessageType.AUDIO;
            }
        }
        
        if (filename != null && !filename.isEmpty()) {
            int lastDotIndex = filename.lastIndexOf('.');
            if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
                String extension = filename.substring(lastDotIndex + 1).toLowerCase();
                if (isImageExtension(extension)) {
                    return MessageType.IMAGE;
                }
                if (isAudioExtension(extension)) {
                    return MessageType.AUDIO;
                }
            }
        }
        
        return MessageType.FILE;
    }

    private boolean isImageExtension(String extension) {
        return switch (extension) {
            case "jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "ico", "tiff", "tif" -> true;
            default -> false;
        };
    }

    private boolean isAudioExtension(String extension) {
        return switch (extension) {
            case "mp3", "wav", "ogg", "m4a", "aac", "flac", "webm", "wma", "opus", "amr" -> true;
            default -> false;
        };
    }

    private NotificationType mapMessageTypeToNotificationType(MessageType messageType) {
        return switch (messageType) {
            case IMAGE -> NotificationType.IMAGE;
            case AUDIO -> NotificationType.AUDIO;
            case FILE -> NotificationType.FILE;
            default -> NotificationType.MESSAGE;
        };
    }

    private String getSenderId(Chat chat, Authentication authentication) {
        if (chat.getSender().getId().equals(authentication.getName())) {
            return chat.getSender().getId();
        }
        return chat.getRecipient().getId();
    }

    private String getRecipientId(Chat chat, Authentication authentication) {
        if (chat.getSender().getId().equals(authentication.getName())) {
            return chat.getRecipient().getId();
        }
        return chat.getSender().getId();
    }

    @Transactional
    public void updateMessage(Long messageId, String content, Authentication authentication) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new EntityNotFoundException("Message not found"));
        message.setContent(content);
        messageRepository.save(message);
        Chat chat = message.getChat();
        String senderId = authentication.getName();
        String recipientId = message.getRecipientId();
        userSynchronizer.updateLastSeen(senderId);
        Notification notification = Notification.builder()
                .chatId(chat.getId())
                .messageType(message.getType())
                .content(content)
                .senderId(senderId)
                .recipientId(recipientId)
                .type(NotificationType.MESSAGE)
                .chatName(chat.getChatName(senderId))
                .build();
        notificationService.sendNotification(notification, recipientId);
    }

    @Transactional
    public void deleteMessage(Long messageId, Authentication authentication) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new EntityNotFoundException("Message not found"));
        message.setContent("This message was deleted");
        messageRepository.save(message);
        Chat chat = message.getChat();
        String senderId = authentication.getName();
        String recipientId = message.getRecipientId();
        userSynchronizer.updateLastSeen(senderId);
        Notification notification = Notification.builder()
                .chatId(chat.getId())
                .messageType(message.getType())
                .content("This message was deleted")
                .senderId(senderId)
                .recipientId(recipientId)
                .type(NotificationType.MESSAGE)
                .chatName(chat.getChatName(senderId))
                .build();
        notificationService.sendNotification(notification, recipientId);
    }

}
