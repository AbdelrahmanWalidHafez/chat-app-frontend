package com.domain.chat_app.ws.notification.service.impl;

import com.domain.chat_app.ws.notification.model.Notification;
import com.domain.chat_app.ws.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService{
    private final SimpMessagingTemplate simpMessagingTemplate;

    public void sendNotification(Notification notification, String userId){
        log.info("Sending notification to user {} with payload {}", userId, notification);
        simpMessagingTemplate.convertAndSendToUser(userId, "/chat", notification);
    }
}
